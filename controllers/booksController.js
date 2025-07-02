import slugify from "slugify";
import connection from "../db.js";
import fs from "fs";

const index = (req, res, next) => {
  const elementiPerPagina = 50;
  const search = req.query.search;
  const page = req.query.page ? req.query.page : 1;

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

  const offset = elementiPerPagina * (page - 1);

  sql += `
    GROUP BY books.id
    LIMIT ${offset}, ${elementiPerPagina}; 
  `;

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
  const slug = req.params.slug;

  const bookSql = `
    SELECT books.*, ROUND(AVG(reviews.vote), 2) AS vote_avg
    FROM books
    LEFT JOIN reviews
    ON books.id = reviews.book_id
    WHERE books.slug = ?
    GROUP BY books.id;
  `;

  const reviewsSql = `
    SELECT *
    FROM reviews
    WHERE reviews.book_id = ?;
  `;

  connection.query(bookSql, [slug], (err, booksResults) => {
    if (err) {
      return next(new Error(err));
    }

    if (booksResults.length === 0) {
      res.status(404).json({
        error: "Book not found",
      });
    } else {
      const bookData = booksResults[0];
      connection.query(reviewsSql, [bookData.id], (err, reviewsResults) => {
        if (err) {
          return new Error(err);
        }

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

const validateRequest = (req) => {
  const { title, author, abstract } = req.body;
  if (!title || !author) {
    return false;
  }
  if (title.length < 4 || author.length < 4 || abstract.length < 20) {
    return false;
  }

  return true;
};

const store = (req, res, next) => {
  // controllo i dati
  if (!validateRequest(req)) {
    return res.status(400).json({
      message: "Dati errati",
    });
  }
  console.log(validateRequest(req));

  // prendiamo i dati del libro dal body della richiesta
  const { title, author, abstract } = req.body;

  const image = req.file.filename;

  // Creiamo lo slug dal titolo
  const slug = slugify(title, {
    lower: true,
    strinct: true,
  });

  // Scriviamo la prepared statement query
  const sql = `
    INSERT INTO books (slug, title, author, abstract, image)
    VALUES (?, ?, ?, ?, ?);
  `;

  // Eseguiamo la query
  connection.query(
    sql,
    [slug, title, author, abstract, image],
    (err, results) => {
      //  Se c'è errore lo giestiamo
      if (err) {
        return next(new Error(err));
      }
      //  Invio la risposta con il codie 201 e id e slug
      return res.status(201).json({
        id: results.insertId,
        slug,
      });
    }
  );
};

const destroy = (req, res, next) => {
  const slug = req.params.slug;

  // verifico se libro esiste
  const bookSql = `
    SELECT *
    FROM books
    WHERE slug = ?
  `;

  connection.query(bookSql, [slug], (err, results) => {
    if (results.length === 0) {
      return res.status(404).json({
        error: "Libro non trovato",
      });
    }

    // Se questo libro ha l'immagine, cancelliamo anche l'immagine
    const filePath = `public/images/books/${results[0].image}`;
    fs.unlinkSync(filePath);

    const bookId = results[0].id;
    const deleteSql = `
      DELETE
      FROM books
      WHERE ID = ?
    `;

    connection.query(deleteSql, [bookId], (err, results) => {
      if (err) {
        return next(new Error(err));
      }
      res.sendStatus(204);
    });
  });
};

const storeReview = (req, res, next) => {
  // dalla request prendiamo l'id
  const { id } = req.params;
  console.log(id);

  // Verifichiamo che il libro con questo id esiste.
  const bookSql = `
    SELECT *
    FROM books
    WHERE id = ?
  `;

  // Se il libro esiste
  connection.query(bookSql, [id], (err, bookResults) => {
    if (bookResults.length === 0) {
      return res.status(404).json({
        error: "Libro non trovato",
      });
    }

    // Preleviamo dal body della richiesta i dati
    const { name, vote, text } = req.body;
    console.log(name, vote, text);

    // Salviamo la nuova review nel database
    const newReviewSql = `
      INSERT INTO reviews (book_id, name, vote, text)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(newReviewSql, [id, name, vote, text], (err, results) => {
      if (err) {
        return next(new Error(err));
      }
      return res.status(201).json({
        message: "Review created",
        id: results.insertId,
      });
    });

    // Inviamo la risposta con il codice 201
  });
};

const controller = {
  index,
  show,
  store,
  destroy,
  storeReview,
};

export default controller;
