module.exports = {
    islogin: function (req, res, next) {
        if (req.isAuthenticated()) {
            //req.isAuthenticated() will return true if user is logged in
            return next();
        } else {
            res.redirect("/login");
        }
    },
    isAdmin: function (req, res, next) {
        if (req.isAuthenticated()) {
            //req.isAuthenticated() will return true if user is logged in

            if (req.user.role == 'admin') {
                return next();
            } else {
                req.flash('error', 'You are not admin user!!!');
                res.redirect("/");
            }

        } else {
            // res.send('<script>alert("You do not have Administrator access")</script>'); 
            res.location('/');
            res.redirect('/');
        }
    }





    
}