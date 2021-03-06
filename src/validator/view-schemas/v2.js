// The JSON Schema for a view definition (version 2.0)
export default {
  additionalProperties: false,
  definitions: {

    // Specific options for array renderers
    arrayOptions: {
      additionalProperties: false,
      type: 'object',
      properties: {

        // When true, an empty item will always be added to the end of the array
        autoAdd: {
          type: 'boolean',
          default: false
        },

        // When true, render input(s) on same line as remove button
        compact: {
          type: 'boolean',
          default: false
        },

        // the cell config for individual items in the array
        itemCell: {
          '$ref': '#/definitions/cell'
        },

        // When true, show label for each item in the array
        showLabel: {
          type: 'boolean',
          default: true
        },

        // When true, array items can be sorted via drag-n-drop
        sortable: {
          type: 'boolean',
          default: false
        }
      }
    },

    // boolean renderer options
    booleanRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'boolean'
        name: {
          enum: ['boolean'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    // button-group renderer options
    buttonGroupRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'button-group'
        name: {
          enum: ['button-group'],
          type: 'string'
        },

        // Size of buttons (small, large, etc)
        size: {
          type: 'string'
        }
      },
      type: 'object'
    },

    // A cell is basically just a "div" it can wrap an array of other cells or it can be a leaf
    // in which case it should define particular "renderer"
    cell: {
      additionalProperties: false,
      properties: {

        // Specific options for if the model this cell is rendering is an array (ignored if the model is not an array)
        arrayOptions: {
          '$ref': '#/definitions/arrayOptions'
        },

        // class names to put on DOM elements
        classNames: {
          additionalProperties: false,
          properties: {
            // the class name for the div that is the cell itself
            cell: {
              type: 'string'
            },

            // the class name for the label of the cell
            label: {
              type: 'string'
            },

            // the class name for the value of the cell (generally an input)
            value: {
              type: 'string'
            }
          },
          type: 'object'
        },

        // cells that are nested within this cell
        children: {
          items: {
            '$ref': '#/definitions/cell'
          },
          type: 'array'
        },

        // Whether or not cell can be expanded/collapsed by user
        collapsible: {
          type: 'boolean'
        },

        // conditionals are triggered by particular values within the data passed into bunsen as a 'value' or entered
        // by the user
        conditions: {
          items: {
            additionalProperties: false,
            properties: {
              // if any of the condition instances in the array are met, the "then" block will be considered
              // in this way, the individual instances in this array are all OR'd together
              if: {
                items: {
                  '$ref': '#/definitions/condition'
                },
                type: 'array'
              },

              // This is the negation of the "if" property.
              // if any of the condition instances in the array are *not* met, the "then" block will be considered
              // in this way, the individual instances in this array are all OR'd together
              // NOTE: if an "if" is specified, the "unless" will be ignored, only one at a time is valid
              unless: {
                items: {
                  '$ref': '#/definitions/condition'
                },
                type: 'array'
              },

              // once conditions are met, the contents of the this "then" block are applied to the parent "cell"
              then: {
                '$ref': '#/definitions/cell'
              }
            },
            type: 'object'
          },
          type: 'array'
        },

        dependsOn: {
          type: 'string'
        },

        // Sub text to render beneath label
        description: {
          type: 'string'
        },

        // Pass through a disabled state to the input of the cell
        disabled: {
          type: 'boolean'
        },

        // name of a cell to extend, must be the name of a cell (a key in the "cellDefinitions" object)
        extends: {
          type: 'string'
        },

        // The user-visible label for this cell
        label: {
          type: 'string'
        },

        // Dotted notation reference to a property in the Model
        model: {
          type: 'string'
        },

        // Text to display when no value is set
        placeholder: {
          type: 'string'
        },

        // Configuration for rendering a portion of the model
        renderer: {
          oneOf: [
            {'$ref': '#/definitions/booleanRenderer'},
            {'$ref': '#/definitions/buttonGroupRenderer'},
            {'$ref': '#/definitions/customRenderer'},
            {'$ref': '#/definitions/numberRenderer'},
            {'$ref': '#/definitions/selectRenderer'},
            {'$ref': '#/definitions/stringRenderer'},
            {'$ref': '#/definitions/textareaRenderer'}
          ]
        },

        // Transforms to perform on read/write
        transforms: {
          additionalProperties: false,
          properties: {
            // transforms that happen when we read data in from the UI
            read: {
              '$ref': '#/definitions/transformArray'
            },

            // transforms that happen when we write data out to the UI
            write: {
              '$ref': '#/definitions/transformArray'
            }
          },
          type: 'object'
        }
      },
      type: 'object'
    },

    // a condition that can use the value (or parts of it) to trigger schema changes
    // each key will be AND'd together, so if you specify more than one condition within the
    // condition object, they must all be satisfied for the condition to be met.
    condition: {
      additionalProperties: {
        properties: {
          contains: {
            type: 'string'
          },
          equals: {
            oneOf: [
              {type: 'array'},
              {type: 'boolean'},
              {type: 'number'},
              {type: 'string'},
              {type: 'object'}
            ]
          }
        },
        type: 'object'
      }
    },

    // custom renderer options
    customRenderer: {
      additionalProperties: true,
      properties: {
        // name can be anything that's not builtin
        name: {
          type: 'string',
          pattern: '^(?!boolean$|button-group$|multi-select$|number$|select$|string|textarea$).*'
        }
      },
      type: 'object'
    },

    // number renderer options
    numberRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'number'
        name: {
          enum: ['number'],
          type: 'string'
        }

        // no options yet
      },
      type: 'object'
    },

    // Transform something to an object
    objectTransform: {
      additionalProperties: false,
      properties: {
        object: {
          additionalProperties: {type: 'string'},
          type: 'object'
        }
      },
      type: 'object'
    },

    // select renderer options
    selectRenderer: {
      additionalProperties: false,
      properties: {

        // the only valid names for a select are 'select' and 'multi-select'
        name: {
          enum: ['select', 'multi-select'],
          type: 'string'
        },

        // the options specific to a select renderer
        options: {
          additionalProperties: false,
          properties: {
            // the attribute of the listed items to use as a label
            labelAttribute: {
              type: 'string'
            },

            // description: the type of model to fetch for list-based inputs
            modelType: {
              type: 'string'
            },

            // description: a hash of key/value pairs to use as query string to fetch values for list-based inputs
            query: {
              additionalProperties: {
                type: 'string'
              },
              type: 'object'
            },

            // the attribute of the listed items to use as a value
            valueAttribute: {
              type: 'string'
            }
          },
          type: 'object'
        }
      },
      type: 'object'
    },

    // string renderer options
    stringRenderer: {
      additionalProperties: false,
      properties: {
        // name can only be 'string'
        name: {
          enum: ['string'],
          type: 'string'
        },

        // Input type (text, password, datetime, etc)
        type: {
          type: 'string'
        }
      },
      type: 'object'
    },

    // Transform a string to another string
    stringTransform: {
      additionalProperties: false,
      properties: {
        from: {type: 'string'},
        global: {type: 'boolean'},
        regex: {type: 'boolean'},
        to: {type: 'string'}
      },
      required: ['from', 'to'],
      type: 'object'
    },

    // textarea renderer options
    textareaRenderer: {
      additionalProperties: false,
      properties: {
        cols: {
          type: 'integer'
        },

        // name can only be 'string'
        name: {
          enum: ['textarea'],
          type: 'string'
        },

        rows: {
          type: 'integer'
        }
      },
      type: 'object'
    },

    // An array of transforms
    transformArray: {
      items: {
        oneOf: [
          {
            '$ref': '#/definitions/objectTransform'
          },
          {
            '$ref': '#/definitions/stringTransform'
          }
        ]
      },
      type: 'array'
    }
  },

  type: 'object',
  properties: {

    // The property names inside cellDefinitions are the names of the cells they define, and can be referenced
    // in the "extends" property of any cell to inherit all the properties of that cellDefinition, allowing the
    // cell doing the extending to override anything from the cellDefinition that is being extended
    cellDefinitions: {
      additionalProperties: {
        '$ref': '#/definitions/cell'
      },
      type: 'object'
    },

    // top-level entry-point cells (if more than one is given, they are displayed as tabs)
    cells: {
      items: {
        '$ref': '#/definitions/cell'
      },
      minItems: 1,
      type: 'array'
    },

    // What kind of view is this? A form that requests information, or detail that displays it?
    type: {
      enum: ['detail', 'form'],
      type: 'string'
    },

    // This schema is just for v2
    version: {
      enum: ['2.0'],
      type: 'string'
    }
  },

  required: [
    'cells',
    'type',
    'version'
  ]
}
