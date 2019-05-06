const pkg = require('./package.json');
// declare rxjs as external
const external = ['rxjs', 'rxjs/operators'];

export default {
  input: './index.js',
  output: {
    name: 'rxstate',
    file: pkg.main,
    format: 'cjs',
  },
  external,
};
