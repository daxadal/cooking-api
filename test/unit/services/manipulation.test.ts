import { deepen, filterNullValues } from "@/services/manipulation";

describe("Object manipulation", () => {
  describe("Deepen object", () => {
    it("Shallow object should remain the same", () => {
      // given
      const flatObject = {
        field1: "value1",
        field2: "value2",
        field3: "value3",
      };

      //when
      const deepObject = deepen(flatObject);

      //then
      expect(deepObject).toStrictEqual(flatObject);
    });

    it("Fields that contain the separator should end up nested", () => {
      // given
      const flatObject = {
        field1: "value1",
        field2_subfield1: "value2",
      };

      //when
      const deepObject = deepen(flatObject);

      //then
      const expectedObject = {
        field1: "value1",
        field2: { subfield1: "value2" },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });

    it("Fields that contain multiple separators should end up nested multiple times", () => {
      // given
      const flatObject = {
        field1_field2_field3_field4_field5_field6_field7: "value",
      };

      //when
      const deepObject = deepen(flatObject);

      //then
      const expectedObject = {
        field1: {
          field2: {
            field3: { field4: { field5: { field6: { field7: "value" } } } },
          },
        },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });

    it("Fields that contain the same starting subkey should end up nested in the same sub-object", () => {
      // given
      const flatObject = {
        field1_subfield1: "value11",
        field1_subfield2: "value12",
        field1_subfield3: "value13",
        field2_subfield1: "value21",
        field2_subfield2: "value22",
        field2_subfield3: "value23",
      };

      //when
      const deepObject = deepen(flatObject);

      //then
      const expectedObject = {
        field1: {
          subfield1: "value11",
          subfield2: "value12",
          subfield3: "value13",
        },
        field2: {
          subfield1: "value21",
          subfield2: "value22",
          subfield3: "value23",
        },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });

    it("Multiple field depths are compatible", () => {
      // given
      const flatObject = {
        field1: "value1",
        field2_subfield1: "value21",
        field2_subfield2: "value22",
        field2_subfield3: "value23",
        field2_subfield4_key: "value241",
      };

      //when
      const deepObject = deepen(flatObject);

      //then
      const expectedObject = {
        field1: "value1",
        field2: {
          subfield1: "value21",
          subfield2: "value22",
          subfield3: "value23",
          subfield4: { key: "value241" },
        },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });

    it("Only the specified fields are taken into account", () => {
      // given
      const flatObject = {
        field1: "value1",
        field2_subfield1: "value21",
        field2_subfield2: "value22",
        field2_subfield3: "value23",
        field2_subfield4_key: "value241",
      };

      //when
      const deepObject = deepen(flatObject, ["field1", "field2_subfield4_key"]);

      //then
      const expectedObject = {
        field1: "value1",
        field2: {
          subfield4: { key: "value241" },
        },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });

    it("Fields are split through the specified separator", () => {
      // given
      const flatObject = {
        field1: "value1",
        "field2.subfield1": "value21",
        "field2.subfield2": "value22",
        "field2.subfield3": "value23",
        "field2.subfield4.key": "value241",
      };

      //when
      const deepObject = deepen(flatObject, undefined, ".");

      //then
      const expectedObject = {
        field1: "value1",
        field2: {
          subfield1: "value21",
          subfield2: "value22",
          subfield3: "value23",
          subfield4: { key: "value241" },
        },
      };
      expect(deepObject).toStrictEqual(expectedObject);
    });
  });

  describe("Filter null values", () => {
    it("Objects with non-null values should remain the same", () => {
      // given
      const object = {
        field1: "value1",
        field2: "value2",
        field3: "value3",
      };

      //when
      const filteredObject = filterNullValues(object);

      //then
      expect(filteredObject).toStrictEqual(object);
    });

    it("Objects with `undefined` or falsy values should remain the same", () => {
      // given
      const object = {
        field1: "value1",
        field2: undefined,
        field3: 0,
        field4: false,
      };

      //when
      const filteredObject = filterNullValues(object);

      //then
      expect(filteredObject).toStrictEqual(object);
    });

    it("Objects with `null` values should filter out those keys", () => {
      // given
      const object = {
        field1: "value1",
        field2: null,
        field3: 0,
        field4: null,
      };

      //when
      const filteredObject = filterNullValues(object);

      //then
      const expectedObject = {
        field1: "value1",
        field3: 0,
      };
      expect(filteredObject).toStrictEqual(expectedObject);
    });

    it("Only the specified fields are taken into account", () => {
      // given
      const object = {
        field1: "value1",
        field2: "value2",
        field3: "value3",
        field4: null,
      };

      //when
      const filteredObject = filterNullValues(object, [
        "field1",
        "field3",
        "field4",
      ]);

      //then
      const expectedObject = {
        field1: "value1",
        field3: "value3",
      };
      expect(filteredObject).toStrictEqual(expectedObject);
    });
  });
});
