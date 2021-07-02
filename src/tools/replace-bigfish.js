// const fs = require('fs');
const replace = require('replace-in-file');

const replaceMap = {
  'admin-demo.abf.alibaba-inc.com':
    'standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo',
  'gitlab.alibaba-inc.com/yk-open/stand-admin-demo/tree/daily/9999.0.1/':
    'github.com/StandAdmin/stand-admin-antdpro-demo/tree/main/',
  'gitlab.alibaba-inc.com/yk-open/stand-admin-demo/blob/daily/9999.0.1/':
    'github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/',
};

const options = {
  files: ['docs/**/*'],
  from: [],
  to: [],
};

Object.keys(replaceMap).forEach(key => {
  options.from.push(key);
  options.to.push(replaceMap[key]);
});

Promise.all([
  replace(options),
  // replace({
  //   files: options.files,
  //   from: /<a[\s\S]*?\.abf\.[\s\S]*?>([\s\S]*?)<\/a>/m,
  //   to: (match, p1) => p1.trim(),
  // }),
])
  // .then((results) => {
  //   console.log('Replacement results:', results);
  // })
  .catch(error => {
    console.error('Error occurred:', error);
  });
