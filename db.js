'use strict'

const express = require('express')
const mysql = require('mysql')

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '2100',
    user: 'root',
    password: '',
    database: "node_buah"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

const createBuahTable = () => {
    let sql = `
        create table buah (
            id int unsigned auto_increment primary key,
            nama_buah varchar(191) not null,
            harga_buah varchar(50) not null,
            stock int unsigned default 0,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        ) `

        db.query(sql, (err, result) => {
            if (err) throw err 

            console.log('tabel buah sudah dibuat')
        })
}

const createUsersTable = () => {
    let sql = `
        create table users (
            id int unsigned auto_increment primary key,
            username varchar(100) not null,
            password varchar(255) not null,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )`

        db.query(sql, (err, result) => {
            if (err) throw err
            
            console.log('tabel user sudah dibuat')
        } )
}

const createUserBuahTable = () => {
    let sql = `
        create table user_buah (
            id int unsigned auto_increment primary key,
            user_id int not null,
            buah_id int not null,
            created_at timestamp default current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('tabel user_buah sudah dibuat')
    })
}


createBuahTable()
createUsersTable()
createUserBuahTable()
