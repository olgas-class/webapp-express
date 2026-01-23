import slugify from "slugify";
import connection from "../database/dbConnection.js";

function index(req, res, next) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const itemsPerPage = 12;
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

    const queryTotale = "SELECT COUNT(`id`) AS `total` FROM `books`";

    connection.query(queryTotale, (err, resultTotale) => {
      if (err) return next(err);

      const totalBooks = resultTotale[0].total;

      return res.json({
        info: {
          total: totalBooks,
          pages: Math.ceil(totalBooks / itemsPerPage),
          currentPage: page,
        },
        results: result,
      });
    });
  });
}

function show(req, res, next) {
  const slug = req.params.slug;

  const query = `
    SELECT books.*, CAST(AVG(reviews.vote) AS FLOAT) AS vote_avg
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    WHERE books.slug = ?`;

  connection.query(query, [slug], (err, results) => {
    if (err) return next(err);

    console.log(results);

    if (results.length === 0 || results[0].id === null) {
      res.status(404);
      return res.json({
        error: "NOT FOUND",
        message: "Libro non trovato",
      });
    }

    const book = results[0];

    // SE IL LIBRO È STATO TROVATO, RECUPERIAMO LE RECENSIONI
    const reviewsQuery = "SELECT * FROM `reviews` WHERE `book_id` = ?";

    connection.query(reviewsQuery, [book.id], (err, reviewsResult) => {
      if (err) return next(err);

      res.json({
        ...book,
        reviews: reviewsResult,
      });
    });
  });
}

function search(req, res, next) {
  const key = req.query.key;

  const searchKey = `%${key}%`;

  const query = `
    SELECT books.*, CAST(AVG(reviews.vote) AS FLOAT) AS avg_vote
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    WHERE title LIKE ? 
    OR abstract LIKE ? 
    GROUP BY books.id
  `;

  connection.query(query, [searchKey, searchKey], (err, results) => {
    if (err) return next(err);
    res.json({
      results: results,
    });
  });
}

function store(req, res, next) {
  const { title, author, abstract } = req.body;

  console.log(req.body, req.file);

  const slug = slugify(title, {
    lower: true,
    strict: true, // rimuove caratteri speciali
  });

  const fileName = req.file?.filename || null;

  const sql =
    "INSERT INTO `books` (`slug`, `title`,`author`, `abstract`, `image`) VALUES  (?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [slug, title, author, abstract, fileName],
    (err, result) => {
      if (err) return next(err);

      res.status(201);
      return res.json({
        message: "Il libro è stato salvato con success",
        bookId: result.insertId,
        bookSlug: slug,
      });
    },
  );
}

function storeReview(req, res, next) {
  const data = req.body;
  const bookId = req.params.id;

  const bookQuery = "SELECT * FROM `books` WHERE `id` = ?";

  connection.query(bookQuery, [bookId], (err, result) => {
    if (err) return next(err);

    if (result.length === 0) {
      res.status(404);
      return res.json({
        error: "NOT FOUND",
        message: "Libro non trovato",
      });
    }

    // controllo i dati
    if (!data.name || !data.vote || data.vote < 1 || data.vote > 5) {
      res.status(400);
      return res.json({
        error: "CLIENT ERROR",
        message:
          "Il nome e il voto sono obbligatorie. Il voto eve essere compreso tra 1 e 5",
      });
    }

    const sql =
      "INSERT INTO `reviews` (book_id, name, vote, text) VALUES (?, ?, ?, ?);";

    connection.query(
      sql,
      [bookId, data.name, data.vote, data.text],
      (err, result) => {
        if (err) return next(err);

        res.status(201);
        res.json({
          message: "La review è stata aggiunta",
          id: result.insertId,
        });
      },
    );
  });
}

export default { index, show, search, storeReview, store };
