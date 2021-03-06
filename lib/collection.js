import {getBookingsForCourse} from "./methods/bookingMethods";
import {getBookingsForLevel} from "./methods/bookingMethods";
import {getBookingsForSlot} from "./methods/bookingMethods";
import {getOrg} from "./methods/orgMethods";
import {getCourse} from "./methods/courseMethods";
import {getLevel} from "./methods/levelMethods";
import {getSlot} from "./methods/slotMethods";
import {getPublicRouteToCourse} from "./router";
import {getLevelsForCourse} from "./methods/levelMethods";
import {getSlotsForCourse} from "./methods/slotMethods";
export const Courses = new Meteor.Collection("courses")
export const Levels = new Meteor.Collection("levels")
export const Slots = new Meteor.Collection("slots")
export const Bookings = new Meteor.Collection("bookings")
export const Attendance = new Meteor.Collection("attendance")
export const Orgs = new Meteor.Collection("orgs")

Courses.helpers({
  org() {
    return getOrg(this.orgId, false)
  },

  registrationPath() {
    return getPublicRouteToCourse(this)
  },

  homeUrlWithHttpInFront() {
    const homeUrl = this.homeUrl
    if (!homeUrl) {
      return null
    }

    if (homeUrl.startsWith("http")) {
      return homeUrl
    } else {
      return "http://" + homeUrl
    }
  },

  hasStarted() {
    if (this.startDate.getTime() < new Date().getTime()) {
      return true
    } else {
      return false
    }
  },

  isFull() {
    return this.bookingCount() >= this.bookingLimit()
  },

  canBook() {
    return this.bookingOpen() && !this.hasStarted()
  },

  bookingOpen() {
    const openDate = this.bookingOpenDate
    const now = new Date()
    return !openDate || now >= openDate
  },

  bookingCount() {
    let count = 0
    const slots = Slots.find({courseId: this._id})
    slots.forEach((slot) => {
      count = count + slot.bookingCount
    })
    return count
  },

  bookingLimit() {
    let limit = 0
    const slots = Slots.find({courseId: this._id})
    slots.forEach((slot) => {
      limit = limit + slot.limit
    })
    return limit
  },

  availableCount() {
    let count = 0
    const slots = Slots.find({courseId: this._id})
    slots.forEach((slot) => {
      count = count + (slot.limit - slot.bookingCount)
    })
    return count
  },

  levels() {
    return getLevelsForCourse(this._id)
  },

  slots() {
    return getSlotsForCourse(this._id)
  },

  paidCount() {
    let paid = 0
    const bookings = getBookingsForCourse(this._id)
    bookings.forEach((booking) => {
      if (booking.paid) {
        paid += 1
      }
    })
    return paid
  },

  unpaidCount() {
    let unpaid = 0
    const bookings = getBookingsForCourse(this._id)
    bookings.forEach((booking) => {
      if (!booking.paid) {
        unpaid += 1
      }
    })
    return unpaid
  }




})

Levels.helpers({
  prerequisiteDescription() {
    if (this.prerequisite) {
      return this.prerequisite
    } else {
      return "Inga"
    }
  },

  org() {
    return getOrg(this.orgId, false)
  },

  course() {
    return Courses.findOne({_id: this.courseId})
  },

  bookingCount() {
    return getBookingsForLevel(this._id).count()
  }
})

Slots.helpers({
  name() {
    return this.levelName() + " " + this.datePeriod + " " + this.time
  },

  levelName() {
    const level = Levels.findOne({_id: this.levelId})
    if (level) {
      return level.name
    } else {
      return ""
    }
  },

  level() {
    return getLevel(this.levelId, false)
  },

  course() {
    return getCourse(this.courseId, false)
  },

  org() {
    return getOrg(this.orgId, false)
  },

  isFull() {
    return this.bookingCount >= this.limit
  },

  isBookable() {
    if (this.isFull()) {
      return false
    }
    if (this.course().hasStarted()) {
      return false
    }
    return true
  },

  bookings() {
    return Bookings.find({slotId: this._id}, {sort: ['childFirstName', 'childLastName']})
  },

  bookingCount() {
    return getBookingsForSlot(this._id).count()
  },


  availableSpace() {
    const available = this.limit - this.bookingCount
    if (available < 0) {
      return 0
    } else {
      return available
    }
  }

})

Bookings.helpers({
  childFullName() {
    return this.childFirstName + " " + this.childLastName
  },

  slot() {
    return getSlot(this.slotId, false)
  },

  level() {
    return getLevel(this.levelId, false)
  },

  course() {
    return getCourse(this.courseId, false)
  },

  org() {
    return getOrg(this.orgId, false)
  }

})