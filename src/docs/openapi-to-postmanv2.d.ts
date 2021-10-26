declare module "openapi-to-postmanv2" {
  function convert(input, options, cb);

  function validate(input);

  function getMetaData(input, cb);

  function mergeAndValidate(input, cb);

  function getOptions(mode, criteria);
}
