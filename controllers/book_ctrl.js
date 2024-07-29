const Book = require('../models/book');

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
        .catch(error => { res.status(400).json({ error })})
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error: error });
        }
    );
};

exports.getAllBook = (req, res, next) => {
    const book = [
        {
            _id: 'dfhgqsigh',
            title: 'Mon livre',
            author: 'Auteur de livre',
            imageUrl: 'https://secure.sogides.com/public/produits/9782/226/189/gr_9782226189646.jpg',
            year: '1999',
            genre: 'Roman',
            
        },
        {
            _id: 'dfdsfghdsh',
            title: 'Encore livre',
            author: 'Auteur de livre',
            imageUrl: 'https://static.fnac-static.com/multimedia/Images/FR/NR/83/2e/c9/13184643/1540-1/tsp20210122075833/Mon-livre-des-odeurs-et-des-couleurs-ma-journee.jpg',
            year: '2010',
            genre: 'Roman',
            
        }
    ];
    res.status(200).json(book);
};