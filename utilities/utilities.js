
const computePercentage = (currVal, goalVal) => {
  let max = currVal > goalVal ? currVal : goalVal;
  let min = max === currVal ? goalVal : currVal;
  return Math.round((min/max) * 100);;
}

const formatDate = (date) => {
  let newDate = new Date(date);
  newDate = newDate.toISOString().split('T')[0];
  return newDate;
}
module.exports = {computePercentage, formatDate};

