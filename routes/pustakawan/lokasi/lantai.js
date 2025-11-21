const express = require('express')
const router = express.Router()
//import model lantai 
const Lantai = require('../../../models/Lantai')
// import model pengguna
// import middleware untuk mengecek peran pengguna login
const {authPustakawan} = require('../.././../middlewares/auth')

//menampilakn semua data lantai
router.get('/', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data lantai
        const data = await Lantai.getAll()

        res.render('pengurus/pustakawan/lokasi/lantai/index', {data, user})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pengurus/lantai')
    }
})

//menampilkan halaman untuk menambahkan data lantai
router.get('/buat', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        res.render('pengurus/pustakawan/lokasi/lantai/buat', { 
            user,
            data: req.flash('data')[0]
        })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pengurus/lantai')
    }
})

//menabahkan data lantai baru
router.post('/create', authPustakawan, async (req, res) => {
    try {
        // destructuring req.body
        const {kode_lantai} = req.body

        // menyimpan data yang diinputkan user
        const data = {kode_lantai}

        // input kode lantai tidak boleh kosong
        if (!data.kode_lantai) {
            req.flash("error", "Kode lantai tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/lantai/buat')
        }

        // memeriksa apakah kode_lantai sudah ada
        if (await Lantai.checkLantaiCreate(data)) {
            req.flash("error", "Lantai Sudah dibuat")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/lantai/buat')
        }

        await Lantai.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/pustakawan/lantai')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/lantai')
    }
})

//menampilkan halaman untuk mengedit kode lantai
router.get('/edit/:id', authPustakawan, async(req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil data lantai berdasarkan id
        const data = await Lantai.getById(id)

        res.render('pengurus/pustakawan/lokasi/lantai/edit', {data, user})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/lantai')
    }
})

//memgupdate data lantai berdasarkan id
router.post('/update/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // destructuring req.body
        const {kode_lantai} = req.body

        // menyimpan data yang diinputkan user
        const data = {kode_lantai}
        
        // input kode lantai tidak boleh kosong
        if (!kode_lantai) {
            req.flash("error", "Kode lantai tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/lantai/edit/${id}`)
        }

        // memeriksa apakah kode_lantai sudah ada
        if (await Lantai.checkLantaiUpdate(data, id)) {
            req.flash("error", "Lantai Sudah dibuat")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/lantai/edit/${id}`)
        }

        // memperbarui data lantai
        await Lantai.update(data, id)
        req.flash('success', 'Data Berhasil Diedit')
        res.redirect('/pustakawan/lantai')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        req.flash('data', req.body)
        return res.redirect('/pustakawan/lantai')
    }
})

//mengapus data lantai berdasarakn id
router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // memeriksa apakah lantai sudah digunakan
        if (await Lantai.checkLantaiUsed(id)) {
            req.flash("error", "Lantai masih digunakan oleh ruangan lain")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/lantai')
        }

        await Lantai.delete(id)
        req.flash('success', 'Data Berhasil Dihapus')
        res.redirect('/pustakawan/lantai')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/lantai')
    }
})

module.exports = router