module.exports = class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { page, sort, limit, fields, ...rest } = this.queryString;
    let queryStr = JSON.stringify(rest);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);

    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createAt');
    }

    return this;
  }

  limitFeilds() {
    if (this.queryString.fields) {
      const fieldsContent = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsContent);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const curPage = this.queryString.page * 1 || 1;
    const curLimit = this.queryString.limit * 1 || 100;
    const skip = (curPage - 1) * curLimit;

    this.query = this.query.skip(skip).limit(curLimit);

    return this;
  }
};
