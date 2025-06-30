import connection from "../db.js";

const index = (req, res, next) => {
  const search = req.query.search;

  let sql = `
    SELECT books.*, ROUND(AVG(reviews.vote), 2) AS vote_avg
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id`;
  const params = [];

  if (search !== undefined) {
    sql += `
      WHERE books.title LIKE ?
    `;
    params.push(`%${search}%`);
  }

  sql += ` GROUP BY books.id;`;

  connection.query(sql, params, (err, results) => {
    if (err) {
      return next(new Error(err));
    }
    const books = results.map((curBook) => {
      return {
        ...curBook,
        image: curBook.image ? `${req.imagePath}/${curBook.image}` : null,
      };
    });

    res.json({
      data: books,
    });
  });
};

const show = (req, res, next) => {
  const id = req.params.id;

  const bookSql = `
    SELECT books.*, ROUND(AVG(reviews.vote), 2) AS vote_avg
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    WHERE books.id = ?
    GROUP BY books.id;
  `;

  const reviewsSql = `
    SELECT *
    FROM reviews
    WHERE reviews.book_id = ?;
  `;

  connection.query(bookSql, [id], (err, booksResults) => {
    if (err) {
      return next(new Error(err));
    }

    if (booksResults.length === 0) {
      res.status(404).json({
        error: "Book not found",
      });
    } else {
      connection.query(reviewsSql, [id], (err, reviewsResults) => {
        if (err) {
          return new Error(err);
        }
        const bookData = booksResults[0];
        res.json({
          data: {
            ...bookData,
            image: bookData.image ? `${req.imagePath}/${bookData.image}` : null,
            reviews: reviewsResults,
          },
        });
      });
    }
  });
};

const controller = {
  index,
  show,
};

export default controller;
