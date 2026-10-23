class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Search
  search(fields = []) {
    if (this.queryString.search) {
      const keyword = this.queryString.search;

      this.query = this.query.find({
        $or: fields.map((field) => ({
          [field]: {
            $regex: keyword,
            $options: "i",
          },
        })),
      });
    }

    return this;
  }

  // Filter
  filter() {
    const queryObj = { ...this.queryString };

    ["search", "page", "limit", "sort"].forEach(
      (el) => delete queryObj[el]
    );

    this.query = this.query.find(queryObj);

    return this;
  }

  // Sort
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(
        this.queryString.sort.split(",").join(" ")
      );
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // Pagination
  paginate() {
    const page = Number(this.queryString.page) || 1;

    const limit = Number(this.queryString.limit) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;