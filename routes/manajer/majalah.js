const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const Majalah = require('../../models/Majalah')
const Pegawai = require('../../models/Pegawai')
const {authManajer} = require('../../middlewares/auth')

const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../public/images/majalah', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

router.get('/', authManajer, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        const flashedKeyword = req.flash('keyword')[0]
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        if (flashedKeyword) {
            const majalah = await Majalah.searchJudulMajalahHapus(flashedKeyword)
            const totalMajalah = majalah.length
            const totalHalaman = 1
            return res.render('pengurus/manajer/majalah/index', {majalah, user, page: 1, totalHalaman, keyword: flashedKeyword})
        }

        const majalah = await Majalah.getMajalahHapus(limit, offset)
        const totalMajalah = majalah.length
        const totalHalaman = Math.ceil(totalMajalah / limit)

        res.render('pengurus/manajer/majalah/index', { majalah, user, page, totalHalaman })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/majalah')
    }
})

router.post('/search', authManajer, async (req, res) => {
    try {
        const {judul} = req.body
        req.flash('keyword', judul)
        return res.redirect('/manajer/majalah')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/majalah')
    }
})

router.get('/:id', authManajer, async (req, res) => {
    try {
        // mengambil id dari params
        const {id} = req.params
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)
        
        const majalah = await Majalah.getByIdHapus(id)

        res.render('pengurus/manajer/majalah/detail', { majalah, user })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/majalah')
    }
})

router.post('/edit/:id', authManajer, async (req, res) => {
    try {
        // mengambil id dari params
        const {id} = req.params
        // mengambil status data dari body
        const {status_data} = req.body
        // menyimpan data yang diinputkan user
        const data = {status_data}

        await Majalah.updateStatusData(data, id)

        req.flash('success', 'Majalah berhasil ditampilkan')
        res.redirect('/manajer/majalah')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/majalah')
    }
})

router.post('/delete/:id', authManajer, async (req, res) => {
    try {
        // mengambil id dari params
        const { id } = req.params
        
        // menghapus foto lama
        const majalah = await Majalah.getCoverByIdHapus(id)
        const oldPhoto = majalah.foto_cover
        deleteOldPhoto(oldPhoto)
        
        await Majalah.hardDelete(id)

        req.flash('success', 'Majalah berhasil dihapus')
        res.redirect('/manajer/majalah')
    } catch (err) {
        req.flash('error', err.message)
        res.redirect('/manajer/majalah')
    }
})

module.exports = router