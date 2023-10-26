"use strict";

const { BadRequestError } = require("../expressError");

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

/** takes object of filters like: {minEmployees: 2}
 *
 * return an array containing a
 *  SQL formatted Where clause string and an array of values
 * ex. ["WHERE name ILIKE $1", ["%c1%"]]
 */
function createWhereClause(filters) {
  if (filters?.minEmployees > filters?.maxEmployees) {
    throw new BadRequestError("Max should be greater than Min.");
  }

  let whereClauses = [];
  let values = [];

  for (const key in filters) {
    if (key === "nameLike") {
      values.push(`%${filters[key]}%`);
      whereClauses.push(`name ILIKE $${values.length}`);
    } else if (key === "minEmployees") {
      values.push(Number(filters[key]));
      whereClauses.push(`num_employees >= $${values.length}`);
    } else if (key === "maxEmployees") {
      values.push(Number(filters[key]));
      whereClauses.push(`num_employees <= $${values.length}`);
    }
  }

  let where = whereClauses.join(" AND ");

  if (values.length !== 0) {
    where = "WHERE ".concat(where);
  }

  return [where, values];
}

module.exports = { sqlForPartialUpdate, createWhereClause };
