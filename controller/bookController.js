import connection from "../database/dbConnection.js";

function index(req, res, next) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const itemsPerPage = 3;
  const offset = (page - 1) * itemsPerPage;

  const query = `
    SELECT books.*, CAST(AVG(reviews.vote) AS FLOAT) AS avg_vote
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    GROUP BY books.id
    LIMIT ? OFFSET ?
  `;

  connection.query(query, [itemsPerPage, offset], (err, result) => {
    if (err) return next(err);
    return res.json({
      results: result,
    });
  });
}

function show(req, res, next) {
  const id = req.params.id;

  const query = `
    SELECT books.*, CAST(AVG(reviews.vote) AS FLOAT) AS vote_avg
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    WHERE books.id = ?`;

  connection.query(query, [id], (err, results) => {
    if (err) return next(err);

    if (results.length === 0) {
      res.status(404);
      return res.json({
        error: "NOT FOUND",
        message: "Libro non trovato",
      });
    }

    const book = results[0];

    // SE IL LIBRO È STATO TROVATO, RECUPERIAMO LE RECENSIONI
    const reviewsQuery = "SELECT * FROM `reviews` WHERE `book_id` = ?";

    connection.query(reviewsQuery, [id], (err, reviewsResult) => {
      if (err) return next(err);

      res.json({
        ...book,
        reviews: reviewsResult,
      });
    });
  });
}

export default { index, show };
