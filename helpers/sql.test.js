const { sqlForPartialUpdate, createWhereClause } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  // test updating a company with valid data
  test("works", function () {
    const dataToUpdate = {
      handle: "new",
      name: "New",
      description: "New Description",
      numEmployees: 1,
      logoUrl: "http://new.img",
    };
    const jsToSql = {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"handle"=$1, "name"=$2, "description"=$3, "num_employees"=$4, "logo_url"=$5`,
      values: ["new", "New", "New Description", 1, "http://new.img"],
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
      logoUrl: "logo_url",
    };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"handle"=$1, "name"=$2, "description"=$3, "numEmployees"=$4, "logo_url"=$5`,
      values: ["new", "New", "New Description", 1, "http://new.img"],
    });
  });

  //test updating a company with empty data
  test("empty input, throw error", function () {
    const dataToUpdate = {};
    const jsToSql = {};
    try {
      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("createWhereClause", function () {
  test("works: nameLike", function () {
    const result = createWhereClause({ nameLike: "c1" });
    expect(result).toEqual(["WHERE name ILIKE $1", ["%c1%"]]);
  });

  test("works: minEmployees", function () {
    const result = createWhereClause({ minEmployees: 3 });
    expect(result).toEqual(["WHERE num_employees >= $1", [3]]);
  });

  test("works: maxEmployees", function () {
    const result = createWhereClause({ maxEmployees: 1 });
    expect(result).toEqual(["WHERE num_employees <= $1", [1]]);
  });

  test("invalid filter", function () {
    try {
      const result = createWhereClause({ badFilter: 1 });
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("minEmployees > maxEmployees: BadRequest error", function () {
    try {
      const result = createWhereClause({ minEmployees: 100, maxEmployees: 50 });
      console.warn("filter by worked test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
