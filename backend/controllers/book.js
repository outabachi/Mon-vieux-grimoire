const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const userId = req.auth.userId;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: userId,
        imageUrl: req.file.link
    });
    book.save()
        .then(() => {
            res.status(201).json({ message: 'Objet enregistré !' });
        })
        .catch(error => {
            res.status(400).json({ error: error.message });
        });

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
            res.status(404).json({
                error: error
            });
        }
    );
};
exports.modifyBook = async (req, res, next) => {
    try {
        let oldBook;
        const book = new Book({
            _id: req.params.id,
            title: req.body.title,
            description: req.body.description,
            year: req.body.year,
            userId: req.body.userId,
            author: req.body.author,
            genre: req.body.genre,
        });
        if (req.file) {
            book.imageUrl = req.file.link;
            oldBook = await Book.findOne({ _id: req.params.id});
        }
        await Book.updateOne({ _id: req.params.id }, book)

        if (req.file) {
            console.log(oldBook);
            const filename = oldBook.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
            console.log("fichier suppr : "+ filename)
            });
        }
        res.status(201).json({
            message: 'Book updated successfully!'
        });
    } catch (error) {
        res.status(400).json({
            error: error
        });
    }

};
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};
exports.getAllBook = (req, res, next) => {
    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.bestRating = async (req, res, next) => {
    try {
        const books = await Book.find()
            .sort({ averageRating: -1 })
            .limit(3);

        res.status(200).json(books);
    } catch (e) {
        res.status(500).json({ error: e })
    }

};
exports.rating = (req, res, next) => {
    const { userId, rating } = req.body;

    Book.findOne({ _id: req.params.id })
        .then(book => {

            book.ratings.push({ userId, grade: rating });

            const totalRatings = book.ratings.length;
            const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = sumRatings / totalRatings;


            book.save()
                .then(updatedBook => res.status(200).json(updatedBook))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
