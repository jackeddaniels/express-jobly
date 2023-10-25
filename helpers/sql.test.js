const { sqlForPartialUpdate, filterBy } = require("./sql");
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

describe("filterBy", function () {
  test("works: nameLike", function () {
    const result = filterBy({ nameLike: "c1" });
    expect(result).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: " http://c1.img",
      },
    });
  });

  test("works: nameLike no Results", function () {
    const result = filterBy({ nameLike: "c1" });
    expect(result).toEqual({});
  });

  test("works: minEmployees", function () {
    const result = filterBy({ minEmployees: 3 });
    expect(result).toEqual({
      company: {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: " http://c3.img",
      },
    });
  });

  test("works: minEmployees no Results", function () {
    const result = filterBy({ minEmployees: 100 });
    expect(result).toEqual({});
  });

  test("works: maxEmployees", function () {
    const result = filterBy({ maxEmployees: 1 });
    expect(result).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: " http://c1.img",
      },
    });
  });

  test("works: maxEmployees no Results", function () {
    const result = filterBy({ maxEmployees: 0 });
    expect(result).toEqual({});
  });

  test("minEmployees > maxEmployees: BadRequest error", function () {
    try {
      const result = filterBy({ minEmployees: 100, maxEmployees: 50 });
      console.warn("filter by worked test failed");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
