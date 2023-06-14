/*
 * INTER-Mediator
 * Copyright (c) INTER-Mediator Directive Committee (http://inter-mediator.org)
 * This project started at the end of 2009 by Masayuki Nii msyk@msyk.net.
 *
 * INTER-Mediator is supplied under MIT License.
 * Please see the full license for details:
 * https://github.com/INTER-Mediator/INTER-Mediator/blob/master/dist-docs/License.txt
 */

/**
 * @fileoverview IMLibQueue class is defined here.
 */
/**
 *
 * Usually you don't have to instanciate this class with new operator.
 * Thanks for nice idea from: http://stackoverflow.com/questions/17718673/how-is-a-promise-defer-library-implemented
 * @constructor
 */
const IMLibQueue = {
  tasks: [], // {do: (complete)=>{}, later: boolean}
  isExecute: false,
  dataStore: {},
  dsLabel: 0,
  readyTo: false,
  laterWaitMS: 100,

  getNewLabel: function () {
    'use strict'
    IMLibQueue.dsLabel++
    return IMLibQueue.dsLabel
  },

  getDataStore: function (label, key) {
    'use strict'
    if (!IMLibQueue.dataStore[label]) {
      IMLibQueue.dataStore[label] = {}
    }
    return IMLibQueue.dataStore[label][key]
  },

  setDataStore: function (label, key, value) {
    'use strict'
    if (!IMLibQueue.dataStore[label]) {
      IMLibQueue.dataStore[label] = {}
    }
    IMLibQueue.dataStore[label][key] = value
  },

  setTask: function (aTask, startHere, later = false) {
    if (startHere) {
      IMLibQueue.isExecute = true
      aTask(() => {
      })
      IMLibQueue.isExecute = false
    } else {
      IMLibQueue.tasks.push({do: aTask, later: later})
      if (!IMLibQueue.readyTo) {
        setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? 100 : 0)
        IMLibQueue.readyTo = true
      }
    }
  },

  setPriorTask: function (aTask, later = false) {
    IMLibQueue.tasks.unshift({do: aTask, later: later})
    if (!IMLibQueue.readyTo) {
      setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? IMLibQueue.laterWaitMS : 0)
      IMLibQueue.readyTo = true
    }
  },

  setSequentialTasks: function (tasksArray) {
    'use strict'
    for (const aTask of tasksArray) {
      IMLibQueue.tasks.push({do: aTask, later: false})
    }
    if (!IMLibQueue.readyTo) {
      setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? IMLibQueue.laterWaitMS : 0)
      IMLibQueue.readyTo = true
    }
  },

  setSequentialPriorTasks: function (tasksArray) {
    'use strict'
    let start = 0
    for (const aTask of tasksArray) {
      IMLibQueue.tasks.splice(start, 0, {do: aTask, later: false})
      start += 1
    }
    if (!IMLibQueue.readyTo) {
      setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? IMLibQueue.laterWaitMS : 0)
      IMLibQueue.readyTo = true
    }
  },

  startNextTask: function () {
    'use strict'
    if (IMLibQueue.isExecute) {
      if (IMLibQueue.tasks.length > 0) {
        setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? IMLibQueue.laterWaitMS : 0)
        IMLibQueue.readyTo = true
      }
      return
    }
    if (IMLibQueue.tasks.length > 0) {
      let aTask = IMLibQueue.tasks[0]
      let isExists = false
      if (aTask.later) {
        for (let i = 1; i < IMLibQueue.tasks.length; i++) {
          if (!IMLibQueue.tasks[i].later) {
            aTask = IMLibQueue.tasks[i]
            IMLibQueue.tasks.splice(i, 1)
            isExists = true
          }
        }
      }
      if (!isExists) {
        aTask = IMLibQueue.tasks.shift()
      }
      IMLibQueue.isExecute = true
      IMLibQueue.readyTo = false
      aTask.do(function () {
        IMLibQueue.isExecute = false
        if (IMLibQueue.tasks.length > 0) {
          setTimeout(IMLibQueue.startNextTask, IMLibQueue.tasks[0].later ? IMLibQueue.laterWaitMS : 0)
          IMLibQueue.readyTo = true
        }
      })
    }
  }
}

// @@IM@@IgnoringRestOfFile
module.exports = IMLibQueue
  