var assert = require("assert");
var request = require("request");
var fs = require("fs");
var cheerio = require('cheerio');
var html = '';


var mochoc=function(_tests,_filePath,_templatePath){
    var tests=_tests,
        filePath=_filePath,
        templatePath=_templatePath,
        run=function(){
            describe('API Tests', function () {
                describe('Cases', function () {
                    tests.forEach(function (test) {
                        it(test.name, function (done) {
                            var verb = test.method.toLowerCase().trim();
                            switch (verb) {
                                case 'get':
                                    request
                                        .get(test, function (err, res, body) {
                                            test.assert(err, res, body);
                                            test.body = body;
                                            done();
                                        });
                                    break;
                                case 'post':
                                    request
                                        .post(test, function (err, res, body) {
                                            test.assert(err, res, body);
                                            test.body = body;
                                            done();
                                        });
                                    break;
                                default :
                                    assert.equal(verb, 'get/post', 'verb must be get or post');
                                    done();
                                    break;
                            }
                        });
                    });
                    before(function () {
                        html = fs.readFileSync(filePath, 'utf8');
                    });
                    after(function () {
                        $ = cheerio.load(html);
                        var apiListDiv = $('#api-list');
                        var apisDiv = $('#apis');

                        for (var i = 0; i < tests.length; i++) {
                            var test = tests[i];
                            test.testId = test.name.toLowerCase().trim().replace(/ /g, '-');
                            test.descId = test.testId + '-desc';
                            var apiListItemDiv = $('#' + test.testId);
                            var apiDescItemDiv = $('#' + test.descId);


                            if (apiListItemDiv.length === 0) {
                                $(apiListDiv).append(
                                    getItemHtml(test)
                                );
                            }
                            else {

                            }

                            if (apiDescItemDiv.length === 0) {
                                $(apisDiv).append(
                                    getDescriptionHtml(test)
                                );
                            }
                            else {

                            }
                        }
                        fs.writeFileSync('/var/www/html/index.html', $.html());

                        function getItemHtml(test) {
                            return '<li id="' + test.testId + '"><a href="#' + test.descId + '">' + test.name + '</a></li>';
                        }

                        function getDescriptionHtml(test) {
                            var response=JSON.stringify(test.body, null, "    ");
                            var request='';
                            if(test.method.toLowerCase()!='get' && test.method.toLowerCase()!='delete'){
                                var request=JSON.stringify(test.json, null, "    ");
                                request ='<pre class="orange jsonContainer">'+request+'</pre>';
                            }
                            var str='<li id="'+test.descId+'"><h1>'+test.name+'</h1><hr><h4>'+test.method.toUpperCase()+'</h4><h4><a href="'+test.uri+'">'+test.uri+'</a></h4>'+request+'<pre class="greenyellow jsonContainer">'+response+'</pre><hr></li>';
                            return str;
                        }
                    });
                });
            });
        };
    return{
        run:run
    }
}

module.exports=mochoc;

