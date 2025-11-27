const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const fs = require('fs')
// import model penerbit koran 
const PenerbitKoran = require('../../../models/PenerbitKoran')
// import model pegawai
const Pegawai = require('../../../models/Pegawai')
// import middleware untuk mengecek peran pengguna login
const {authPustakawan} = require('../.././../middlewares/auth')
// import middleware untuk compress dan convert image ke webp
const { convertImageFile } = require('../../../middlewares/convertImage')

//konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/images/penerbit-koran'))
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, unique + path.extname(file.originalname))
    }
})

//instalisasi multer dengan konfigurasi storage
const upload = multer({ storage })

// Fungsi untuk menghapus file yang diupload
const deleteUploadedFile = (input) => {
    if (!input) return

    const files = Array.isArray(input) ? input : [input]

    for (const file of files) {
        if (!file || !file.filename) continue
        const filePath = path.join(__dirname, '../../../public/images/penerbit-koran', file.filename)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
}

// Fungsi untuk menghapus foto lama saat update
const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../../public/images/penerbit-koran', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}


router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const penerbitKoran = await PenerbitKoran.getAll()

        res.render('pustakawan/koran/penerbitKoran/index', {penerbitKoran, pegawai})
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/dashboard')
    }
})

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        res.render('pustakawan/koran/penerbitKoran/buat', {
            pegawai,
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/penerbit-koran')
    }
})

router.post('/create', authPustakawan, upload.single('foto'), async (req, res) => {
    try {
        const {nama_penerbit} = req.body
        const data = {nama_penerbit}
        
        if (!data.nama_penerbit) {
            deleteUploadedFile(req.file)
            req.flash("error", "Penerbit Koran tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/penerbit-koran/buat')
        }

        if (!req.file) {
            deleteUploadedFile(req.file)
            req.flash("error", "Foto tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/penerbit-koran/buat')
        }

        // mengecek format file yang diinput
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/penerbit-koran/buat')
        }

        if (await PenerbitKoran.checkPenerbitKoranCreate(data)) {
            deleteUploadedFile(req.file)
            req.flash("error", "Penerbit Koran sudah dibuat")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/penerbit-koran/buat')
        }

        //convert image to webp and compress when < 500kb
        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto = path.basename(result.outputPath)
            }
        }

        await PenerbitKoran.store(data)
        req.flash('success', 'Data Berhasil ditambahkan')
        res.redirect('/pustakawan/penerbit-koran')
    } catch (err) {
        deleteUploadedFile(req.file)
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/penerbit-koran')
    }
})

router.get('/edit/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const penerbitKoran = await PenerbitKoran.getById(id)

        res.render('pustakawan/koran/penerbitKoran/edit', {
            pegawai,
            penerbitKoran,
            data: req.flash('data')[0]
        })

    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/penerbit-koran')
    }
})

router.post('/update/:id', authPustakawan, upload.single('foto'), async (req, res) => {
    try {
        const {id} = req.params
        const {nama_penerbit} = req.body
        const data = {nama_penerbit}

        // mendapatkan foto penerbit koran berdasarkan id
        const penerbitKoran = await PenerbitKoran.getFotoById(id)
        const foto = req.file ? req.file.filename : penerbitKoran.foto

        if (!data.nama_penerbit) {
            deleteUploadedFile(req.file)
            req.flash("error", "Penerbit Koran tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/penerbit-koran/edit/${id}`)
        }

        // mengecek format file yang diinput
        if (req.file) {
            const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if (!allowedFormats.includes(req.file.mimetype)) {
                deleteUploadedFile(req.file)
                req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
                req.flash('data', req.body)
                return res.redirect(`/pustakawan/penerbit-koran/edit/${id}`)
            }
        }

        if (await PenerbitKoran.checkPenerbitKoranUpdate(data, id)) {
            deleteUploadedFile(req.file)
            req.flash("error", "Penerbit Koran sudah dibuat")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/penerbit-koran/edit/${id}`)
        }

        //convert image to webp and compress when < 500kb
        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto = path.basename(result.outputPath)
                // hapus foto lama jika ada foto baru
                if (penerbitKoran.foto) {
                    deleteOldPhoto(penerbitKoran.foto)
                }
            }
        } else {
            data.foto = foto
        }

        await PenerbitKoran.update(data, id)
        req.flash('success', 'Data berhasil diedit')
        res.redirect('/pustakawan/penerbit-koran')
    } catch (err) {
        deleteUploadedFile(req.file)
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/penerbit-koran')
    }
})

router.post('/hapus/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params

        if (await PenerbitKoran.checkPenerbitKoranUsed(id)) {
            req.flash("error", "Penerbit Koran masih digunakan pada koran")
            return res.redirect(`/pustakawan/penerbit-koran`)
        }

        // hapus foto sebelum hapus data
        const penerbitKoran = await PenerbitKoran.getFotoById(id)
        if (penerbitKoran && penerbitKoran.foto) {
            deleteOldPhoto(penerbitKoran.foto)
        }

        await PenerbitKoran.delete(id)
        req.flash('success', 'Data berhasil dihapus')
        res.redirect('/pustakawan/penerbit-koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/penerbit-koran')
    }
})
module.exports = router