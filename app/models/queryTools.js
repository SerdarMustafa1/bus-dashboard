const sql = require('./../db');

const formatToSQL = (value) => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return value;
  return 'NULL';
};

const buildFilter = (filter, sep) => {
  if (Object.keys(filter).length === 0) return '';
  return ` WHERE ${Object.keys(filter)
    .map((key) => `${key} = ${formatToSQL(filter[key])}`)
    .join(`${sep ? sep : ' AND '}`)}`;
};

const queryAllAsync = async (table, filter, select) => {
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM ${table} ${buildFilter(filter)}`,
      [],
      (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};
const queryItemAsync = async (table, filter, select) => {
  return await new Promise((resolve, reject) => {
    sql.query(
      `SELECT ${select ? select : '*'} FROM ${table} ${buildFilter(
        filter
      )} LIMIT 1`,
      [],
      (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (data.length > 0) return resolve(data[0]);
        return resolve(null);
      }
    );
  });
};
const skipLimit = (params) => {
  let query = '';
  if (params) {
    if (params.limit && typeof params.limit === 'number')
      query += ` LIMIT ${params.limit}`;
    if (params.skip && typeof params.skip === 'number')
      query += ` OFFSET ${params.skip}`;
  }
  return query;
};

module.exports = {
  filter: buildFilter,
  SQLTableAsync: queryAllAsync,
  SQLRowAsync: queryItemAsync,
  skipLimit,
};
