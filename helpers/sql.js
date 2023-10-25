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
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
