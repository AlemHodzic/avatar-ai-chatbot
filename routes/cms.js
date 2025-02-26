const express = require('express');
const router = express.Router();
const fs = require('node:fs');
const crypto = require('crypto');
const themeRoot = './themes';

router.get('/', async (req, res) => {
    res.send('this is the cms route');
})

router.get('/new', async (req, res) => {

    let newGuid = generateUuid();

    //newGuid = '215000dc-d7e0-8502-e651-73b0352a65d6';
    //console.log(newGuid);

    const newFolderName = themeRoot + '/' + newGuid;
    const newPathFileName = newFolderName + '/avatarConfig.json';
    const content = '{ result : true }';


    if (!folderExists(newFolderName)) {
        console.log('map aanmaken')
        createFolder(newFolderName)
        console.log('map is aangemaakt')
    }
    else {
        console.log('de map ' + newFolderName + ' bestaat al');
    }

    res.status(200).json({ result: true });

})

router.post('/loadtheme', async (req, res) => {

    const filePath = themeRoot + '/' + req.body.themeId + '/settings.json';

    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        let settings = JSON.parse(data);

        req.session.assistantId = settings.app.assistentId;
        req.session.avatarId = settings.app.avatarId;
        req.session.voiceId = settings.app.voiceId;

        //console.log('from session');
        //console.log(req.session.assistantId);

        res.status(200).json(settings);

        //console.log('test');
        //console.log(settings.app.assistentId);


    });



})

function createThemeFile(configGuid) {

    //console.error(newPathFileName);
    fs.writeFile(newPathFileName, content, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
            res.status(200).json({ result: 'file aangemaakt' });
        }
    });

}



//custom functions
async function folderExists(folderPath) {

    try {
        if (!fs.existsSync(folderPath)) {
            return true;
        }
    } catch (err) {
        console.log('map bestaat al')
        return false;
    }
}

function createFolder(folderPath) {
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    } catch (err) {
        console.error(err);
    }
}


const generateUuid = () => {
    return [4, 2, 2, 2, 6] // or 8-4-4-4-12 in hex
        .map(group => crypto.randomBytes(group).toString('hex'))
        .join('-');
};



// export the router module so that server.js file can use it
module.exports = router;
