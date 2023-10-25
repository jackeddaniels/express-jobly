"use strict";

const { BadRequestError } = require("../expressError");
const db = require("../db");

/** Takes updated data, converts to SQL
 *
 * dataToUpdate = data submitted to update
 * ex. {firstName, description, ... }
 *
 * jsToSql contains keys to update in obj form
 * ex. {"firstName": "first_name"}
 *
 * If no data is passed in, throw BadRequestError, otherwise
 * Returns an object with two keys setCols (string values), values (array of values)
 * ex. {
 *  setCols: `"first_name"=$1, '"description"=$2 ... `,
 *  values: ['Aliya', 'New Description' ...]
 * }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** takes object of filters and returns filtered object of SQL results
 *
 * filters like: {nameLike: "string", minEmployees: 20}
 *
 * return a object of filtered results from SQL query
 */
async function filterBy(filters) {
  let whereClauses = ["WHERE"];
  for (const key in filters) {
    if ("nameLike" === key) {
      whereClauses.push(`name ILIKE '%${filters[key]}%'`);
    } else if ("minEmployees" === key) {
      whereClauses.push(`name > ${filters[key]}`);
    } else if ("maxEmployees" === key) {
      whereClauses.push(`name < ${filters[key]}`);
    }
  }

  const querySql = `
      SELECT * FROM COMPANIES
      WHERE $1 
      RETURNING
          handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"`;
  const result = await db.query(querySql, [whereClauses]);
  const companys = result.rows[0];
}

module.exports = { sqlForPartialUpdate, filterBy };
