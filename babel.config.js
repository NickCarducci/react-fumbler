const path = require('path');
const env = ['@babel/preset-env', {
    "targets": "defaults"
}]
//unlike array, object prints with variable as field
const plugins =
    ["@babel/plugin-proposal-class-properties",
        {
            //loose: true,
            include: path.resolve(__dirname, 'src', 'index.js'),
            exclude: /(node_modules)/
        }]
export default function (api) {

    /** this is just for minimal working purposes,
       * for testing larger applications it is
       * advisable to cache the transpiled modules in
       * node_modules/.bin/.cache/@babel/register* */
    //api.cache(false);
    return {
        "presets":
            ["@babel/preset-react", env],
        plugins
    }
};