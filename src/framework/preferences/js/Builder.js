/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {
    fluid.registerNamespace("fluid.prefs");

    fluid.defaults("fluid.prefs.builder", {
        gradeNames: ["fluid.eventedComponent", "fluid.prefs.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        assembledPrefsEditorGrade: {
            expander: {
                func: "fluid.prefs.builder.generateGrade",
                args: ["prefsEditor", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.prefs.assembler.prefsEditor"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        assembledUIEGrade: {
            expander: {
                func: "fluid.prefs.builder.generateGrade",
                args: ["uie", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.prefs.assembler.uie"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        constructedGrades: {
            expander: {
                func: "fluid.prefs.builder.constructGrades",
                args: ["{that}.options.auxSchema", ["enactors", "messages", "panels", "rootModel", "templateLoader", "messageLoader", "templatePrefix", "messagePrefix"]]
            }
        },
        mappedDefaults: "{primaryBuilder}.options.schema.properties",
        components: {
            primaryBuilder: {
                type: "fluid.prefs.primaryBuilder",
                options: {
                    typeFilter: {
                        expander: {
                            func: "fluid.prefs.builder.parseAuxSchema",
                            args: "{builder}.options.auxiliarySchema"
                        }
                    },
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.primarySchema",
            removeSource: true,
            target: "{that > primaryBuilder}.options.primarySchema"
        }]
    });

    fluid.defaults("fluid.prefs.assembler.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: "{that}.options.enhancerType",
                    enhancerType: "fluid.pageEnhancer",
                    components: {
                        uiEnhancer: {
                            options: {
                                gradeNames: ["{fluid.prefs.assembler.uie}.options.componentGrades.enactors"]
                            }
                        }
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.enhancer",
            removeSource: true,
            target: "{that uiEnhancer}.options"
        }]
    });

    fluid.defaults("fluid.prefs.assembler.prefsEditor", {
        gradeNames: ["autoInit", "fluid.viewComponent", "fluid.prefs.assembler.uie"],
        components: {
            prefsEditorLoader: {
                type: "fluid.viewComponent",
                container: "{fluid.prefs.assembler.prefsEditor}.container",
                priority: "last",
                options: {
                    gradeNames: ["{fluid.prefs.assembler.prefsEditor}.options.componentGrades.templatePrefix", "{fluid.prefs.assembler.prefsEditor}.options.componentGrades.messagePrefix", "{fluid.prefs.assembler.prefsEditor}.options.componentGrades.messages", "{that}.options.prefsEditorType"],
                    prefsEditorType: "fluid.prefs.separatedPanel",
                    templateLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEditor}.options.componentGrades.templateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEditor}.options.componentGrades.messageLoader"]
                    },
                    prefsEditor: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEditor}.options.componentGrades.panels", "{fluid.prefs.assembler.prefsEditor}.options.componentGrades.rootModel", "fluid.prefs.uiEnhancerRelay"]
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.prefsEditorType",
            removeSource: true,
            target: "{that > prefsEditorLoader}.options.prefsEditorType"
        }, {
            source: "{that}.options.prefsEditor",
            removeSource: true,
            target: "{that prefsEditor}.options"
        }]
    });

    fluid.prefs.builder.generateGrade = function (name, namespace, options) {
        var gradeNameTemplate = "%namespace.%name";
        var gradeName = fluid.stringTemplate(gradeNameTemplate, {name: name, namespace: namespace});
        fluid.defaults(gradeName, options);
        return gradeName;
    };

    fluid.prefs.builder.constructGrades = function (auxSchema, gradeCategories) {
        var constructedGrades = {};
        fluid.each(gradeCategories, function (category) {
            var gradeOpts = auxSchema[category];
            if (fluid.get(gradeOpts, "gradeNames")) {
                constructedGrades[category] = fluid.prefs.builder.generateGrade(category, auxSchema.namespace, gradeOpts);
            }
        });
        return constructedGrades;
    };

    fluid.prefs.builder.parseAuxSchema = function (auxSchema) {
        var auxTypes = [];
        fluid.each(auxSchema, function parse(field) {
            var type = field.type;
            if (type) {
                auxTypes.push(type);
            }
        });
        return auxTypes;
    };

})(jQuery, fluid_1_5);
