const connection = require('../configs/database')

class Kategori {
    // mengambil semua data pada tabel kategori
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // menyimpan data baru pada tabel kategori
    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO kategori SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengupdate data pada tabel kategori berdasarkan id
    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE kategori SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengambil satu data kategori berdasarkan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // menghapus data pada tabel kategori berdasarkan id
    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM kategori WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kategori sudah ada untuk create
    static async checkKategoriCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT kategori FROM kategori WHERE kategori = ?`, [data.kategori])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kategori sudah ada untuk update
    static async checkKategoriUpdate(data, id) {
        try {
            const [rows] = await connection.query(`SELECT kategori FROM kategori WHERE kategori = ? and id != ?`, [data.kategori, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kategori sudah digunakan
    static async checkKategoriUsed(id) {
        try {
            const [rowsBuku] = await connection.query(`SELECT id FROM buku WHERE id_kategori = ?`, [id])
            const [rowsMajalah] = await connection.query(`SELECT id FROM majalah WHERE id_kategori = ?`, [id])
            return rowsBuku.length > 0 || rowsMajalah.length > 0
        } catch (err) {
            throw err
        }
    }

    static async findByName(name) {
        if (!name) return null
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori WHERE LOWER(kategori) = LOWER(?) LIMIT 1`, [name])
            return rows[0] || null
        } catch (err) {
            throw err
        }
    }

    static async findOrCreateByName(name) {
        if (!name) return null
        const trimmed = name.trim()
        if (!trimmed) return null

        const existing = await this.findByName(trimmed)
        if (existing) return existing

        try {
            const [result] = await connection.query(`INSERT INTO kategori (kategori) VALUES (?)`, [trimmed])
            return { id: result.insertId, kategori: trimmed }
        } catch (err) {
            throw err
        }
    }
}

module.exports = Kategori
