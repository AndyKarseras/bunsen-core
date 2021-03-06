'use strict'

import '../typedefs'
import _ from 'lodash'

import {dereference} from '../dereference'

import {
  addWarningResult,
  aggregateResults,
  ensureJsonObject,
  validateRequiredAttribute
} from './utils'

import cellValidatorFactory from './cell'
import viewSchema from './view-schemas/v2'

export {validate as validateModel} from './model'
import {validate as _validateValue} from './value'
export const validateValue = _validateValue

/**
 * Make sure the cells (if specified) are valid
 * @param {BunsenView} view - the schema to validate
 * @param {BunsenModel} model - the JSON schema that the cells will reference
 * @param {CellValidator} cellValidator - the validator instance for a cell in the current view
 * @returns {BunsenValidationResult} the result of validating the cells
 */
function _validateCells (view, model, cellValidator) {
  // We should already have the error for it not existing at this point, so just fake success
  // this seems wrong, but I'm not sure of a better way to do it - ARM
  if (!view.cells) {
    return {
      errors: [],
      warnings: []
    }
  }

  const results = _.map(view.cells, (rootCell, index) => {
    const path = `#/cells/${index}`
    const cellId = rootCell.extends

    if (cellId) {
      const cell = view.cellDefinitions[cellId]
      const cellPath = `#/cellDefinitions/${cellId}`
      const cellResults = [
        validateRequiredAttribute(rootCell, path, 'extends', Object.keys(view.cellDefinitions))
      ]

      if (cell !== undefined) {
        cellResults.push(
           cellValidator.validate(cellPath, cell)
        )
      }

      return aggregateResults(cellResults)
    }

    return [
      cellValidator.validate(`#/cells/${index}`, rootCell)
    ]
  })

  return aggregateResults(results)
}

/**
 * Validate the root attributes of the view
 * @param {BunsenView} view - the view to validate
 * @param {BunsenModel} model - the JSON schema that the cells will reference
 * @param {CellValidator} cellValidator - the validator instance for a cell in the current view
 * @returns {BunsenValidationResult} any errors found
 */
function _validateRootAttributes (view, model, cellValidator) {
  const results = [
    _validateCells(view, model, cellValidator)
  ]

  const knownAttributes = ['version', 'type', 'cells', 'cellDefinitions']
  const unknownAttributes = _.difference(_.keys(view), knownAttributes)
  results.push({
    errors: [],
    warnings: _.map(unknownAttributes, (attr) => {
      return {
        path: '#',
        message: `Unrecognized attribute "${attr}"`
      }
    })
  })

  return aggregateResults(results)
}

/**
 * Validate the given view
 * @param {String|View} view - the view to validate (as an object or JSON string)
 * @param {BunsenModel} model - the JSON schema that the cells will reference
 * @param {String[]} renderers - the list of available custom renderers to validate renderer references against
 * @param {Function} validateRenderer - function to validate a renderer
 * @returns {BunsenValidationResult} the results of the view validation
 */
export function validate (view, model, renderers, validateRenderer) {
  let strResult = null
  const temp = ensureJsonObject(view)
  view = temp[0]
  strResult = temp[1]

  if (view === undefined) {
    return {
      errors: [{path: '#', message: 'Invalid JSON'}],
      warnings: []
    }
  }

  if (model === undefined) {
    return {
      errors: [{path: '#', message: 'Invalid Model'}],
      warnings: []
    }
  }

  const derefModel = dereference(model).schema
  const cellValidator = cellValidatorFactory(view.cellDefinitions, derefModel, renderers, validateRenderer)
  const schemaResult = _validateValue(view, viewSchema, true)
  if (schemaResult.errors.length !== 0) {
    return schemaResult
  }

  const results = [
    schemaResult,
    _validateRootAttributes(view, derefModel, cellValidator)
  ]

  const allCellPaths = _.map(view.cellDefinitions, (cell, index) => {
    return `#/cellDefinitions/${index}`
  })

  const validatedPaths = cellValidator.cellsValidated
  const missedPaths = _.difference(allCellPaths, validatedPaths)
  missedPaths.forEach((path) => {
    addWarningResult(results, path, 'Unused cell was not validated')
  })

  if (strResult !== null) {
    results.push(strResult)
  }

  return aggregateResults(results)
}

export default validate
