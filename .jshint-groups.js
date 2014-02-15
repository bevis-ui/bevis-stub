module.exports = {
    options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        undef: true,
        unused: true,
        trailing: true,
        maxlen: 120,
        quotmark: 'single'
    },
    groups: {
        client: {
            options: {
                browser: true,
                predef: ['modules']
            },
            includes: [
                'blocks/**/*.js',
                'pages/*/blocks/**/*.js',
                'server/*/*.js'
            ],
            excludes: [
                'core/{vow,inherit}/*.js',
                'blocks/**/*.{bt,test}.js',
                'pages/*/blocks/**/*.{bt,test}.js',
                'blocks/**/*.i18n/**',
                'server/*/*.page.js'
            ]
        },

        'bt templates': {
            options: {
                predef: ['module']
            },
            includes: [
                'blocks/**/*.bt.js'
            ]
        },

        server: {
            options: {
                node: true
            },
            includes: [
                'configs/*/*.js',
                'server/*.js',
                'server/**/*.page.js'
            ]
        },

        tests: {
            options: {
                browser: true,
                predef: [
                    'modules',
                    'describe',
                    'it',
                    'before',
                    'beforeEach',
                    'after',
                    'afterEach'
                ],
                expr: true // for should asserts
            },
            includes: [
                'blocks/**/*.test.js'
            ]
        }
    }
};
