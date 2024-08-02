const Book = require('../models/book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getTopBooks = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
}

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
        .catch(error => {
            console.error("Error saving the book:", error);
            res.status(400).json({ error });
        })
};

exports.creatRatingBook = (req, res, next) => {
    const ratingBook = {
        userId: req.auth.userId, 
        grade: req.body.rating
    }

    if (ratingBook.grade < 1 || ratingBook.grade > 5) {
        return res.status(400).json({ error: 'La note doit etre entre 1 et 5' });
    }

    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (!book) {
                return res.status(404).json({ error: "Livre n'existe pas"});
            } 
            const alreadyRated = book.ratings.some(r => r.userId === ratingBook.userId);

            if (alreadyRated) {
                res.status(400).json({ message: 'Vous avez déjà noté ce livre' })
            } else {
                book.ratings.push(ratingBook);
                const bookRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
                book.averageRating = (bookRatings / (book.ratings.length || 1)).toFixed(2);

                book.save()
                    .then((book) => res.status(200).json(book))
                    .catch(error => {
                        res.status(400).json({ error });
                    });
            }
        })
        .catch(error => {
            { res.status(500).json({ error })}}
        )};


exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then((book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error: error });
        }
    );
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                if (book.imageUrl) {
                    const oldImageName = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${oldImageName}`, (err) => {
                        if (err) {
                            console.error('Ancienne image non suprimée', err);
                        }
                    })
                }
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        })
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé' });
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch(error => res.status(500).json({ error }))
};


