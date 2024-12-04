import mongoose, { RootFilterQuery } from 'mongoose'
import { updateProfile, _userPagination, _userPaginator, user, } from './../types/user.type'
import { IUserDocument } from '../interfaces/user.interface'
import { QueryHelper } from '../helpers/query.helper'
import { User } from '../model/user.model'
import { $ } from 'bun'


export const UserService = {
    get: async function (pagination: _userPagination, user_id: string): Promise<_userPaginator> {
        let filter: RootFilterQuery<IUserDocument> = {
            _id: { $nin: new mongoose.Types.ObjectId(user_id) },
            $and: QueryHelper.parseUserQuery(pagination)
        }
        const query = User.find(filter).sort({ last_active: -1 })
        const skip = pagination.pageSize * (pagination.currentPage - 1)
        query.skip(skip).limit(pagination.pageSize)
        const [docs, total] = await Promise.all([
            query.exec(),
            User.countDocuments(filter).exec()
        ])
        pagination.length = total
        return {
            pagination: pagination,
            items: docs.map((doc) => doc.toUser())
        }
    },

    // getByUserName: async function (username: string): Promise<user> {
    //     const user = await User.findOne({ username }).exec()
    //     if (user)
    //         return user.toUser()
    //     throw new Error(`username: "${username}" not found !! `)
    // },

    updateProfile: async function (newProfile: updateProfile, user_id: string): Promise<user> {
        const user = await User.findByIdAndUpdate(user_id, { $set: newProfile }, { new: true, runValidators: true })
        if (user)
            return user.toUser()
        throw new Error('Something went wrong , try again later !!')
    }
}

