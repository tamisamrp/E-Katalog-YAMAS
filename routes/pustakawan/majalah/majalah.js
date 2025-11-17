const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const xlsx = require('xlsx')
// import model majalah
const Majalah = require('../../../models/Majalah')
// import model rak
const Rak = require('../../../models/Rak')
// import model pengguna
// import middleware untuk mengecek peran pengguna
const {authPustakawan} = require('../.././../middlewares/auth')
// import middleware untuk compress dan convert image ke webp
const { convertImageFile } = require('../../../middlewares/convertImage')

//konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/images/majalah'))
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, unique + path.extname(file.originalname))
    }
})

//instalisasi multer dengan konfigurasi storage dan filter ukuran file
const upload = multer({ storage })

const uploadBatch = multer({ storage })

// Fungsi untuk menghapus file yang diupload
const deleteUploadedFile = (input) => {
    if (!input) return

    const files = Array.isArray(input) ? input : [input]

    for (const file of files) {
        if (!file || !file.filename) continue
        const filePath = path.join(__dirname, '../../../public/images/majalah', file.filename)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
}

// Fungsi untuk menghapus foto lama saat update
const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../../public/images/majalah', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

// get majalah
router.get('/', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        const flashedKeyword = req.flash('keyword')[0]
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        if (flashedKeyword) {
            const majalah = await Majalah.searchJudulMajalah(flashedKeyword)
            const totalMajalah = majalah.length
            const totalHalaman = 1
            return res.render('pengurus/pustakawan/majalah/index', {majalah, user, page: 1, totalHalaman, keyword: flashedKeyword})
        }

        const majalah = await Majalah.getMajalah(limit, offset)
        
        const totalMajalah = majalah.length
        const totalHalaman = Math.ceil(totalMajalah / limit)

        res.render('pengurus/pustakawan/majalah/index', { majalah, user, page, totalHalaman })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/dashboard')
    }
})

//search majalah
router.post('/search', authPustakawan, async (req, res) => {
    try {
        const {judul} = req.body
        
        req.flash('keyword', judul)
        return res.redirect('/pustakawan/majalah')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/dashboard')
    }
})

//view buat majalah
router.get('/buat', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data rak
        const rak = await Rak.getAll()
        
        res.render('pengurus/pustakawan/majalah/buat', { 
            rak,
            user,
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/dashboard')
    }
})

//detail majalah
router.get('/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data majalah berdasarakn id
        const majalah = await Majalah.getById(id)
        
        res.render('pengurus/pustakawan/majalah/detail', {majalah, user})
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/majalah')
    }
})

//create new majalah
router.post('/create', authPustakawan, upload.single('foto_cover'), async (req, res) => {
    try {
        // destructuring req.body
        const {judul, edisi, no_klasifikasi, bahasa, tahun_terbit, sinopsis, tempat_terbit, penerbit, id_rak } = req.body
        const foto_cover = req.file ? req.file.filename : null
        
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // menyimpan data yang diinptakn user
        const data = { judul, foto_cover, edisi, no_klasifikasi, bahasa, tahun_terbit, sinopsis, tempat_terbit, penerbit, id_rak, dibuat_oleh: user.nama }

        // inputan judul tidak boleh kosong
        if (!data.judul) {
            deleteUploadedFile(req.file)
            req.flash('error', 'Judul tidak boleh kosong')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // inputan edisi tidak boleh kosong
        if (!data.edisi) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Edisi tidak boleh kosong')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // inputan no_klasifikasi tidak boleh kosong
        if (!data.no_klasifikasi) {
            deleteUploadedFile(req.file)

            req.flash('error', 'No Klasifikasi tidak boleh kosong')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // inputan id rak tidak boleh kosong
        if (!data.id_rak) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Rak tidak boleh kosong')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // inputan foto cover tidak boleh kosong
        if (!data.foto_cover) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Foto Cover tidak boleh kosong')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // memeriksa duplikasi no klasifikasi
        if (await Majalah.checkNoKlasifikasiCreate(data)) {
            deleteUploadedFile(req.file)

            req.flash('error', 'No Klasifikasi sudah ada')
            req.flash('data', data)
            return res.redirect('/pustakawan/majalah/buat')
        }

        // mengecek format file yang diinput
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/majalah/buat')
        }

        //convert image to webp and compress when < 500kb
        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_cover = path.basename(result.outputPath)
            }
        }

        await Majalah.store(data)
        req.flash('success', 'Majalah berhasil ditambahkan')
        return res.redirect('/pustakawan/majalah')
    } catch (err) {
        deleteUploadedFile(req.file)
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/majalah')
    }
})

router.post('/create-batch-majalah', authPustakawan, uploadBatch.array('files'), async (req, res) => {
    try {
        const files = req.files || []
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel' ]

        for (const file of req.files) {
            if (!allowedFormats.includes(file.mimetype)) {
                deleteUploadedFile(req.files)

                req.flash('error', `Tipe file "${file.originalname}" tidak diizinkan. Hanya gambar (jpg, jpeg, png, webp) dan Excel (.xlsx) yang boleh.`)
                return res.redirect('/pustakawan/majalah')
            }
        }
        const excelFile = files.find(f => f.originalname.endsWith('.xlsx') || f.originalname.endsWith('.xls'))
        const imageFiles = files.filter(f => f.mimetype.startsWith('image'))

        if (!excelFile) {
            deleteUploadedFile(files)

            req.flash('error', 'File Excel tidak ditemukan.')
            return res.redirect('/pustakawan/majalah')
        }

        const imgMap = {}
        const filenameToFile = {}
        for (const file of imageFiles) {
            const originalRelPath = file.originalname.replace(/\\/g, '/')
            imgMap[originalRelPath] = file.filename
            imgMap[path.basename(originalRelPath)] = file.filename
            filenameToFile[file.filename] = file
        }

        const workbook = xlsx.readFile(excelFile.path)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = xlsx.utils.sheet_to_json(sheet)

        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        const rak = await Rak.getAll()

        const getIdRak = (kode_rak) => {
            if (!kode_rak) return null
            const found = rak.find(r => (r.kode_rak || '').toLowerCase() == String(kode_rak).toLowerCase())
            return found ? found.id : null
        }

        const validDataList = []

        for (const [index, row] of rows.entries()) {
            const barisKe = index + 2

            const fotoName = path.basename(row.foto_cover || '')
            const filename = imgMap[fotoName] || null

            const data = {
                judul: row.judul,
                edisi: row.edisi,
                no_klasifikasi: row.no_klasifikasi,
                bahasa: row.bahasa,
                tahun_terbit: row.tahun_terbit,
                sinopsis: row.sinopsis,
                tempat_terbit: row.tempat_terbit,
                penerbit: row.penerbit,
                id_rak: getIdRak(row.kode_rak),
                foto_cover: filename,
                dibuat_oleh: user.nama
            }

            if (!filename) {
                deleteUploadedFile(files)

                req.flash('error', `Foto cover "${row.foto_cover}" tidak ditemukan pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/majalah')
            }

            const uploadedImage = imageFiles.find(f => f.filename === filename)
            if (uploadedImage && uploadedImage.size > 2 * 1024 * 1024) {
                deleteUploadedFile(files)

                req.flash('error', `Ukuran foto cover "${row.foto_cover}" pada baris ke-${barisKe} melebihi 2MB`)
                return res.redirect('/pustakawan/majalah')
            }

            if (!data.id_rak) {
                deleteUploadedFile(files)

                req.flash('error', `Rak dengan kode "${row.kode_rak}" tidak ditemukan pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/majalah')
            }

            const checkNoKlasifikasi = await Majalah.checkNoKlasifikasiCreate({ no_klasifikasi: data.no_klasifikasi })
            if (checkNoKlasifikasi) {
                deleteUploadedFile(files)

                req.flash('error', `No klasifikasi "${data.no_klasifikasi}" sudah digunakan pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/majalah')
            }

            if (!data.judul || !data.edisi || !data.no_klasifikasi || !data.id_rak || !data.foto_cover) {
                deleteUploadedFile(files)

                req.flash('error', `Data tidak lengkap pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/majalah')
            }

            validDataList.push({ data, filename })
        }

        const digunakanFotoNames = new Set()

        for (const item of validDataList) {
            const srcFile = filenameToFile[item.filename]
            if (srcFile && srcFile.path) {
                try {
                    const result = await convertImageFile(srcFile.path)
                    if (result && result.outputPath) {
                        item.data.foto_cover = path.basename(result.outputPath)
                        digunakanFotoNames.add(path.basename(result.outputPath))
                    } else {
                        digunakanFotoNames.add(item.filename)
                    }
                } catch (e) {
                    digunakanFotoNames.add(item.filename)
                }
            } else {
                digunakanFotoNames.add(item.filename)
            }

            await Majalah.store(item.data)
        }

        for (const file of imageFiles) {
            if (!digunakanFotoNames.has(file.filename)) {
                deleteOldPhoto(file.filename)
            }
        }

        fs.unlinkSync(excelFile.path)

        req.flash('success', 'Data Majalah berhasil diunggah.')
        res.redirect('/pustakawan/majalah')

    } catch (err) {
        console.error(err)
        if (req.files) {
            for (const file of req.files) {
                fs.unlinkSync(file.path)
            }
        }

        req.flash('error', 'Gagal mengunggah data majalah')
        res.redirect('/pustakawan/majalah')
    }
})

router.get('/edit/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data rak
        const rak = await Rak.getAll()
        // mengambil semua data majalah berdasarkan id
        const majalah = await Majalah.getById(id)

        res.render('pengurus/pustakawan/majalah/edit', { majalah, rak, user })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect(`/pustakawan/majalah`)
    }
})

// Update majalah
router.post('/update/:id', authPustakawan, upload.single('foto_cover'), async (req, res) => {
    try {
        // destructuring req.params
        const { id } = req.params
        // mendapatkan cover majalah berdasarkan id
        const majalah = await Majalah.getCoverById(id)

        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)
        
        // destructuring req.body
        const {judul, edisi, no_klasifikasi, bahasa, tahun_terbit, sinopsis, tempat_terbit, penerbit, id_rak, ketersediaan} = req.body
        const foto_cover = req.file ? req.file.filename : majalah.foto_cover

        // menyimpan data yang diinptakn user
        const data = {judul, foto_cover, edisi, no_klasifikasi, bahasa, tahun_terbit, sinopsis, tempat_terbit, penerbit, id_rak, ketersediaan, diubah_oleh: user.nama}

        // inputan judul tidak boleh kosong
        if (!data.judul) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Judul tidak boleh kosong')
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        // inputan edisi tidak boleh kosong
        if (!data.edisi) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Edisi tidak boleh kosong')
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        // inputan no_klasifikasi tidak boleh kosong
        if (!data.no_klasifikasi) {
            deleteUploadedFile(req.file)

            req.flash('error', 'No Klasifikasi tidak boleh kosong')
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        // inputan id rak tidak boleh kosong
        if (!data.id_rak) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Rak tidak boleh kosong')
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        //cek no_klasifikasi
        if (await Majalah.checkNoKlasifikasiEdit(data, id)) {
            deleteUploadedFile(req.file)

            req.flash('error', 'No Klasifikasi sudah ada')
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        // mengecek format file yang diinput
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/majalah/edit/${id}`)
        }

        // compres dan convert image to webp 
        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_cover = path.basename(result.outputPath)
            }
        }

        // jika ada foto lama dan diupdate dengan foto baru, maka foto lama dihapus
        if (req.file) deleteOldPhoto(majalah.foto_cover)

        await Majalah.update(id, data)
        req.flash('success', 'Majalah berhasil diupdate')
        res.redirect(`/pustakawan/majalah`)
    } catch (err) {
        console.log(err)
        deleteUploadedFile(req.file)
        req.flash('error', err.message)
        res.redirect(`/pustakawan/majalah`)
    }
})

// Delete majalah
router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const { id } = req.params
        
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        await Majalah.softDelete(user, id)

        req.flash('success', 'Majalah berhasil dihapus')
        res.redirect('/pustakawan/majalah')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/majalah')
    }
})

module.exports = router