import * as xlsx from 'xlsx';
import _ from 'lodash';

const flattenObject = (obj) => {
  const flattened = {};
  _.forEach(obj, (value, key) => {
    if (typeof value === 'object' && '_isUTC' in value) {
      flattened[_.upperFirst(_.lowerCase(key))] = value.toISOString();
    } else if (key !== 'empty') {
      flattened[_.upperFirst(_.lowerCase(key))] = +value === value ? value || '' : value;
    }
  });
  return flattened;
};
export default async function downloadExcel(res, data, name = 'Tab') {
  const rows = data.map((datum) => flattenObject(datum));

  console.log('\x1b[31m', rows);
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(rows);
  const rowsT = _.zip.apply(_, [Object.keys(rows[0]), ...rows.map((d) => Object.values(d))]);
  worksheet['!cols'] = rowsT.map((r) => ({ wch: _.max(r.map((d) => (d ? d.toString().length : 1))) * 2 }));

  xlsx.utils.book_append_sheet(workbook, worksheet, name);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.attachment(`${name}.xlsx`);
  res.send(await xlsx.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer',
  }));
  return rows;
}
