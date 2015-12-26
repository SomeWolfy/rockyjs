module.exports = function(grunt) {

    var glob = require('glob')

    grunt.initConfig({
        tintin_root: process.env.TINTIN_ROOT,
        pkg: grunt.file.readJSON('package.json'),
        rockyjs_path: "dist/rocky-<%=pkg.version%>.js",
        uglify: {
            applib: {
                src: '<%= tintin_root %>/build/applib/applib-targets/emscripten/applib.js',
                dest: 'src/transpiled.js'
            }
        },
        concat: {
            rockyjs: {
                src: ['src/html-binding.js', 'src/functions-manual.js', 'src/functions-generated.js',
                      'src/transpiled.js'],
                dest: '<%= rockyjs_path %>'
            }
        },
        newer: {
            options: {
                cache: '.cache'
            }
        },
        processhtml: {
            examples:{
                options: {
                    process: true,
                    data: {rockyjs_path: "<%=rockyjs_path%>"}
                },
                files: [
                    {
                        expand: true,
                        cwd: 'examples',
                        src: ['**/*.*', '!**/*.md'],
                        dest: 'build/examples'
                    },
                    {
                        expand: true,
                        cwd: 'html',
                        src: ['css/*'],
                        dest: 'build'

                    }
                ]
            }
        },
        markdown: {
            all: {
                files: [
                    {
                        expand: true,
                        src: ['examples/*.md', 'readme.md'],
                        dest: 'build',
                        ext: '.html',
                        rename: function(dir, file) {
                            // readme.html -> index.html
                            return dir + "/" + file.replace(/(\breadme)\.html$/, "/index.html")
                        }
                    }
                ],
                options: {
                    template: 'html/markdown/template.html'
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        src: ['dist/**/*'],
                        dest: 'build'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-contrib-copy');

    var default_tasks = [];

    // only run uglify per default if transpiled applib exists at TINTIN_ROOT
    if (glob.sync(grunt.config('uglify').applib.src).length > 0) {
        default_tasks.push("newer:uglify:applib");
    } else {
        grunt.verbose.write("Cannot find transpiled applib at " + grunt.config('uglify').applib.src + " - skipping uglify")
    }

    default_tasks.push('concat:rockyjs', 'processhtml:examples', 'markdown', 'copy');

    // Default task(s).
    grunt.registerTask('default', default_tasks);

};