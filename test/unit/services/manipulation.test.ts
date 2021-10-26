import { deepen } from "@services/manipulation";

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
  });
});
