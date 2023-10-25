
const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError")

describe("sqlForPartialUpdate", function () {
  // test updating a company with valid data
  test("valid input", function () {
    const dataToUpdate = {
      handle: "new",
      name: "New",
      description: "New Description",
      numEmployees: 1,
      logoUrl: "http://new.img",
    };
    const jsToSql = {
      numEmployees: "num_employees",
      logoUrl: "logo_url"
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"handle"=$1, "name"=$2, "description"=$3, "num_employees"=$4, "logo_url"=$5`,
      values: ["new", "New", "New Description", 1, "http://new.img"]
    });
  });

  // test updating a company with invalid data
  test("invalid input", function () {
    const dataToUpdate = {
      handle: "new",
      name: "New",
      description: "New Description",
      numEmployees: 1,
      logoUrl: "http://new.img",
    };
    const jsToSql = {
      logoUrl: "logo_url"
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"handle"=$1, "name"=$2, "description"=$3, "numEmployees"=$4, "logo_url"=$5`,
      values: ["new", "New", "New Description", 1, "http://new.img"]
    });
});

  //test updating a company with empty data
  test("empty input", function () {
    const dataToUpdate = {};
    const jsToSql = {};
    try {
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
