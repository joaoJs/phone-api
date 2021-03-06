const express = require('express');

const PhoneModel = require('../models/phone-model');

const router = express.Router();


// ---> /api/phones
router.get('/phones', (req,res,next) => {
  PhoneModel.find()
    .limit(20)
    .sort({ _id: -1})
    .exec((err, list) => {
        if (err) {
          console.log('Error finding phone ---> ', err);
          res.status(500).json({ errorMessage: 'Finding phones went wrong.' });
          return;
        }

        res.status(200).json(list);
    });
});


router.post('/phones', (req,res,next) => {
  if (!req.user) {
    res.status(401).json({errorMessage: 'Not logged in.'});
    return;
  }
  const thePhone = new PhoneModel({

    name: req.body.name,
    brand: req.body.brand,
    image: req.body.image,
    specs: req.body.specs,
    phoner: req.user._id
  });

  thePhone.save((err) => {
    if (thePhone.errors) {
      res.status(400).json({
        errorMessage: "Validation failed",
        validationErrors: thePhone.errors
      });
      return;
    }

    if (err) {
      console.log('Error POSTING phone  --> ', err);
      res.status(500).json({ errorMessage: 'New phone went wrong'});
      return;
    }

    res.status(200).json(thePhone);
  });
});

router.get('/phones/:id', (req,res,next) => {
   PhoneModel.findById(
     req.params.id,
     (err, phone) => {
       if (err) {
         console.log('phone DETAILS error --->  ', err);
         res.status(400).json({ errorMessage: "Phone details went wrong"});
         return;
       }

       res.status(200).json(phone);
     }
   );
});


//UPDATE
router.put('/phones/:id', (req,res,next) => {
  PhoneModel.findById(
    req.params.id,
    (err, phone) => {
      if (err) {
        console.log('phone DETAILS error --->  ', err);
        res.status(400).json({ errorMessage: "Phone details went wrong"});
        return;
      }

        phone.set({
          name: req.body.name,
          brand: req.body.brand,
          image: req.body.image,
          specs: req.body.specs
        });

        phone.save((err) => {
          if(phone.errors) {
            res.status(400).json({
              errorMessage: 'update validation failed',
              ValidationErrors: phone.errors
            });
            return;
          }

          if (err) {
            console.log('phone UPDATE error ---> ', err);
            res.status(500).json({errorMessage: 'Phone update went wrong'});
            return;
          }

          res.status(200).json(phone);
        });
    }
  );
});


router.delete('/phones/:id', (req,res,next) => {
  if (!req.user) {
    res.status(401).json({errorMessage: 'Not logged in.'});
    return;
  }

  PhoneModel.findById(
    req.params.id,

    (err, phone) => {
      if (err) {
        console.log('Phone OWNER confirmation error --> ', err);
        res.status(500).json({errorMessage: 'phone OWNER confirmation wrong.'});
        return;
      }

      if (phone.phoner.toString() !== req.user._id.toString()) {
        res.status(403).json({errorMessage: 'Phone not yours.'});
        return;
      }

      PhoneModel.findByIdAndRemove(
        req.params.id,
        (err, phone) => {
          if (err) {
            console.log('Phone DELETE error --> ', err);
            res.status(400).json({errorMessage: 'phone delete went wrong.'});
            return;
          }

          res.status(200).json(phone);
        }
      );
    }
  );
});

router.get('/myphones', (req,res,next) => {
  if (!req.user) {
    res.status(401).json({ errorMessage: 'Not logged in.' });
    return;
  }

  PhoneModel.find({phoner: req.user._id})
    .sort({ _id: -1})
    .exec((err, phones) => {
      if (err) {
        res.status(500).json(
          {errorMessage: 'My phone went wrong.'}
        );
        return;
      }

      res.status(200).json(phones);
    });
});


module.exports = router;
