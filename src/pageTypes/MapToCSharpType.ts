export const mapToCSharpType = (sqlType: string): string => {
  switch (sqlType.toUpperCase()) {
    case "INT":
    case "SMALLINT":
    case "TINYINT":
      return "int";

    case "BIGINT":
      return "long";

    case "BIT":
      return "bool";

    case "DECIMAL":
    case "NUMERIC":
    case "MONEY":
    case "SMALLMONEY":
      return "decimal";

    case "FLOAT":
      return "double";

    case "REAL":
      return "float";

    case "DATE":
    case "DATETIME":
    case "DATETIME2":
    case "SMALLDATETIME":
    case "DATETIMEOFFSET":
      return "DateTime";

    case "TIME":
      return "TimeSpan";

    case "UNIQUEIDENTIFIER":
      return "Guid";

    default:
      return "string";
  }
};