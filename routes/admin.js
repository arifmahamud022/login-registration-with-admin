var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer');
require('dotenv').config()


var today = Date.now();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        
        cb(null, today + '_' + file.originalname);
    },
});

var upload = multer({ storage: storage });





var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');

var User = require('../models/user');
var Categories = require('../models/categories');
var Post = require('../models/post');


const { islogin,isAdmin } = require('../config/auth');
const base_url = process.env.BASEURL || 'http://localhost:3000';

router.get('/',isAdmin,  function (req, res, next) {
    res.render('admin/adminindex',
        {
            title: 'This admin Panel',
            baseUrl: base_url,
            flashsms: req.flash('success'),
            user: req.user,
            
        });
});


router.get('/blankpage', function (req, res, next) {
    res.render('admin/blankpage',
        {
            title: 'This admin Panel',
            baseUrl: base_url,
            flashsms: req.flash('success'),
            user: req.user,
            
        });
});

router.get('/user-list', isAdmin, async function (req, res, next) {

    const users = await User.find({});
    console.log(users);
    res.render('admin/user-list', {
        title: 'User account List',
        baseUrl: base_url,
        user: req.user,
        users: users,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});


router.get('/user-edit', isAdmin, async function (req, res, next) {

    const userEdit = await User.findById(req.query.id);
    console.log('user :- ', userEdit);

    const data = {
        title: 'User Edit',
        baseUrl: base_url,
        user: req.user,
        flashsms: req.flash('success'),
        userEdit: userEdit,
        errors: '',
    };

    res.render('admin/user-edit', data);
});


router.post('/user-update', isAdmin,
    
    body('first_name','First Name is required').notEmpty(),
    body('last_name','last Name is required').notEmpty(),
    body('email', 'Email is required.').notEmpty(),
    body('email', 'Email is not valid.').isEmail(),
    body('username', 'Username is required.').notEmpty(),
    body('role', 'Role is required.').notEmpty(),

    async function (req, res, next) {
        var id = req.body.id;
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var email = req.body.email;
        var username = req.body.username;
        var role = req.body.role;

        // console.log('req.body :- ', req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const userEdit = await User.findById(id);
            const data = {
                title: 'User account Edit | Admin admin',
                baseUrl: base_url,
                user: req.user,
                userEdit: userEdit,
                flashsms: req.flash('success'),
                errors: errors.errors,
            };
            res.render('admin/user-edit', data);
        } else {
            var updateUser = {
                name: first_name ,last_name ,
                email: email,
                username: username,
                role: role,
            };

            const upData = await User.updateOne({ _id: id }, updateUser);

            console.log('User Update :- ', upData);

            req.flash('success', 'User update sucssesfuly...')
            res.location(`/admin/user-edit?id=${id}`);
            res.redirect(`/admin/user-edit?id=${id}`);
        }


    }
);


//  User delete Route
router.get('/user-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await User.deleteOne({ _id: id });
    console.log('User delete :- ', delData);
    res.send('User delete');
});




router.get('/new-user', isAdmin, function (req, res, next) {
    res.render('admin/newUser', {
        title: 'New User  | Admin Dashboard',
        baseUrl: base_url,
        flashsms: req.flash('success'),
        user: req.user,
        errors: '',
    });
});


// Use add Route
router.post('/user-add', isAdmin,
    body('first_name','First Name is required').notEmpty(),
    body('last_name','last Name is required').notEmpty(),
    body('email', 'Email is required.').notEmpty(),
    body('email', 'Email is not valid.').isEmail(),
    body('username', 'Username is required.').notEmpty(),
    body('password', 'Password is min 6.').isLength({ min: 6 }),
    body('role', 'Role is required.').notEmpty(),
    async function (req, res, next) {
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var role = req.body.role;
        console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            res.render('admin/newuser', {
                title: 'Add new user account',
                baseUrl: base_url,
                user: req.user,
                errors: '',
            });
        } else {
            const HashedPassword = await bcrypt.hash(password, 10)
            var newUser = new User({
                first_name: first_name ,
                last_name: last_name,
                email: email,
                username: username,
                password: HashedPassword,
                profileimg: '',
                role: role,
            });

            const userName = await User.findOne({ username: username });

            if (userName) {
                const errdt = [
                    {
                        value: username,
                        msg: `${username} This username isn't available!!!`,
                        param: 'username',
                        location: 'body'
                    }
                ];
                res.render('admin/newuser', {
                    title: 'Add new user account',
                    baseUrl: base_url,
                    user: req.user,
                    errors: errdt,
                });
            } else {
                const emailData = await User.findOne({ email: email });
                if (emailData) {
                    const errdt = [
                        {
                            value: email,
                            msg: `${email} This email valid!!!`,
                            param: 'email',
                            location: 'body'
                        }
                    ];
                    res.render('admin/newuser', {
                        title: 'Add new user account',
                        baseUrl: base_url,
                        user: req.user,
                        errors: errdt,
                    });
                } else {
                    const addUser = await new User(newUser).save()
                    console.log('addUser : ', addUser);
                    req.flash('success', 'You are now registered and can loging now..')
                    res.location('/admin/user-list');
                    res.redirect('/admin/user-list');
                }
            }
        }
    }
);


/* GET Category  List page. */
router.get('/category', isAdmin, async function (req, res, next) {
    const categories = await Categories.find({});
    res.render('admin/category', {
        title: 'Category List | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        categories: categories,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});


/* New Category Add. */
router.get('/new-category', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('admin/newCategory', {
        title: 'New Category | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        categoryList: categoryList,
        errors: '',
    });
});



/* Category-add Router */
router.post('/category-add', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    async function (req, res, next) {
        let title = req.body.title;
        let parent_cat = req.body.parent_cat;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        // console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        // console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('admin/newCategory', {
                title: 'New Category | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                categoryList: categoryList,
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const categories = await Categories.find({});
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(categories[i]);
                }
            }

            let newSlug
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }


            var newCat = new Categories({
                slug: newSlug,
                title: title,
                parent_cat: parent_cat,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            });

            const addCat = await new Categories(newCat).save()

            console.log('addCat : ', addCat);

            req.flash('success', 'Category add sucssefuly...')
            res.location('/admin/category');
            res.redirect('/admin/category');
        }

    }
);

//  User delete Route
router.get('/cat-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Categories.deleteOne({ _id: id });
    console.log('Categories delete :- ', delData);
    res.send('Categories delete');
});

/* New Category Add. */
router.get('/category-edit', isAdmin, async function (req, res, next) {

    let catId = req.query.id;
    const category = await Categories.findOne({ _id: catId });
    const categoryList = await Categories.find({});
    res.render('admin/CategoryEdit', {
        title: 'Category Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        category: category,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* Category-update Router */
router.post('/category-update', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    async function (req, res, next) {
        let id = req.body.id;
        let title = req.body.title;
        let parent_cat = req.body.parent_cat;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        console.log(req.body);

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const category = await Categories.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('admin/CategoryEdit', {
                title: 'Category Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                category: category,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const categories = await Categories.find({});
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(categories[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var updateCat = {
                slug: newSlug,
                title: title,
                parent_cat: parent_cat,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            };

            const upData = await Categories.updateOne({ _id: id }, updateCat);

            // console.log('Category Update :- ', upData);

            req.flash('success', 'Category update sucssesfuly...')
            res.location(`/admin/category-edit?id=${id}`);
            res.redirect(`/admin/category-edit?id=${id}`);
        }

    }
);

/* GET post list page. */
router.get('/post-list', isAdmin, async function (req, res, next) {
    const posts = await Post.find({});
    const users = await User.find({});
    const categories = await Categories.find({});

    const userName = (uid) => {
        let userName;
        if (uid == '') { } else {
            users.forEach((user) => {
                if (user._id == uid) {
                    userName = user.name;
                }
            })
        }
        if (userName == undefined) {
            return '';
        } else {
            return userName;
        }
    }

    const catName = (parent_id) => {
        let ptitle;
        if (parent_id == '') { } else {
            categories.forEach((cat) => {
                if (cat._id == parent_id) {
                    ptitle = cat.title;
                }
            })
        }
        if (ptitle == undefined) {
            return '';
        } else {
            return ptitle;
        }
    }

    let postsList = [];

    posts.forEach(async (post) => {
        postsList.push({
            _id: post._id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            category: `${catName(post.category)}`,
            tag: post.tag,
            featured_image: post.featured_image,
            author: `${userName(post.author)}`,
            seo_description: post.seo_description,
            seo_keywords: post.seo_keywords,
            view: post.view,
            date_at: post.date_at,
            __v: post.__v
        })
    })

    res.render('admin/postList', {
        title: 'Post List | Admin Dashboard',
        baseUrl: base_url,
        posts: postsList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        user: req.user,
    });
});

/* New post Add. */
router.get('/new-post', isAdmin, async function (req, res, next) {
    const categoryList = await Categories.find({});
    res.render('admin/newPost', {
        title: 'New Post | Admin Dashboard',
        baseUrl: base_url,
        categoryList: categoryList,
        user: req.user,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* post add Router */
router.post('/post-add', isAdmin,
    upload.single('featured_image'),
    body('title', 'Title is required.').notEmpty(),
    body('description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.').notEmpty(),
    async function (req, res, next) {
        let title = req.body.title;
        let description = req.body.description;
        let category = req.body.category;
        let tag = req.body.tag;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        // console.log(req.body);

        if (req.file) {
            console.log('Uploading File......');
            var featured_image = today + '_' + req.file.originalname;
        } else {
            var featured_image = 'noimage.png';
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('admin/newPost', {
                title: 'New Post | Admin Dashboard',
                baseUrl: base_url,
                categoryList: categoryList,
                user: req.user,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const posts = await Post.find({});
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(posts[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }

            var newPost = new Post({
                slug: newSlug,
                title: title,
                description: description,
                category: category,
                tag: tag,
                featured_image: featured_image,
                category: category,
                author: req.user._id,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            });

            const addPost = await new Post(newPost).save()

            console.log('addPost : ', addPost);

            req.flash('success', 'Post add sucssefuly...')
            res.location('/admin/post-list');
            res.redirect('/admin/post-list');
        }

    }
);

/* New post Add. */
router.get('/post-edit', isAdmin, async function (req, res, next) {

    let postId = req.query.id;
    const post = await Post.findOne({ _id: postId });
    const categoryList = await Categories.find({});
    res.render('admin/postEdit', {
        title: 'Post Edit | Admin Dashboard',
        baseUrl: base_url,
        user: req.user,
        post: post,
        categoryList: categoryList,
        flashsms: req.flash('success'),
        flasherr: req.flash('error'),
        errors: '',
    });
});

/* post update Router */
router.post('/post-update', isAdmin,
    body('title', 'Title is required.').notEmpty(),
    body('description', 'Description is required.').notEmpty(),
    body('category', 'Category is required.').notEmpty(),
    async function (req, res, next) {
        let id = req.body.id;
        let title = req.body.title;
        let description = req.body.description;
        let category = req.body.category;
        let tag = req.body.tag;
        let seo_description = req.body.seo_description;
        let seo_keywords = req.body.seo_keywords;

        // console.log(req.body);
        // const postImg = await Post.findOne({ _id: id });

        // if (req.file) {
        //     upload.single('featured_image');
        //     console.log('Uploading File......');
        //     var featured_image = today + '_' + req.file.originalname;
        // } else {
        //     var featured_image = postImg.featured_image;
        //     console.log('No File Uploading......');
        // }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const post = await Post.findOne({ _id: id });
            const categoryList = await Categories.find({});
            res.render('admin/postEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                post: post,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            let slug = title;
            slug = slug.toLowerCase().replace(/[^\w-]+/g, '-');

            let results = [];

            const posts = await Post.find({});
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].slug.toLowerCase().includes(slug.toLowerCase()) && slug) {
                    results.push(posts[i]);
                }
            }

            let newSlug;
            if (results.length == 0) {
                newSlug = slug;
            } else {
                newSlug = `${slug}-${results.length}`;
            }
            var updatePost = {
                slug: newSlug,
                title: title,
                description: description,
                category: category,
                tag: tag,
                category: category,
                author: req.user._id,
                seo_description: seo_description,
                seo_keywords: seo_keywords,
            };

            const upData = await Post.updateOne({ _id: id }, updatePost);

            console.log('Post Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/admin/post-edit?id=${id}`);
            res.redirect(`/admin/post-edit?id=${id}`);
        }

    }
);

/* post image upload Router */
router.post('/post-image',
    upload.single('featured_image'),
    isAdmin,
    async function (req, res, next) {
        let id = req.body.id;

        // console.log(req.body);
        const post = await Post.findOne({ _id: id });

        if (req.file) {
            console.log('Uploading File......');
            var featured_image = today + '_' + req.file.originalname;
        } else {
            var featured_image = post.featured_image;
            console.log('No File Uploading......');
        }

        // Form Validator
        const errors = validationResult(req);
        console.log(errors)

        if (!errors.isEmpty()) {
            const categoryList = await Categories.find({});
            res.render('admin/postEdit', {
                title: 'Post Edit | Admin Dashboard',
                baseUrl: base_url,
                user: req.user,
                post: post,
                categoryList: categoryList,
                flashsms: req.flash('success'),
                flasherr: req.flash('error'),
                errors: errors.errors,
            });
        } else {
            var updatePost = {
                featured_image: featured_image,
            };

            const upData = await Post.updateOne({ _id: id }, updatePost);

            console.log('Post Update :- ', upData);

            req.flash('success', 'Popst update sucssesfuly...')
            res.location(`/admin/post-edit?id=${id}`);
            res.redirect(`/admin/post-edit?id=${id}`);
        }

    }
);

// Post delete Route
router.get('/post-del', async function (req, res, next) {
    // console.log(req.query);
    var id = req.query.id;
    const delData = await Post.deleteOne({ _id: id });
    console.log('Post delete :- ', delData);
    res.send('Categories delete');
});













module.exports = router;
