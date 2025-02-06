import { Response } from "express"
import { IPaginationQuery, IReqUser } from "../utils/interfaces"
import response from "../utils/response"
import EventModel, { eventDAO, TEvent } from "../models/event.model"
import { FilterQuery } from "mongoose"

export default {
  async create(req: IReqUser, res: Response){
    try {
      const payload = {
        ...req.body,
        createdBy: req.user.id
      } as TEvent

       await eventDAO.validate(payload)
       const result = await EventModel.create(payload)

      response.success(res, result, "Success create an event")

    } catch (error) {
      response.error(res, error, "Failed to create an event")
    }
  },

  async findAll(req: IReqUser, res: Response){
    try {
      const {
        limit = 10,
        page = 1,
        search
      } = req.query as unknown as IPaginationQuery

      const query: FilterQuery<TEvent> = {}

      if(search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search
          }
        })
      }

      const result = await EventModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({createdAt: -1})
        .exec()

        const count = await EventModel.countDocuments(query)

        response.pagination(res, result, {
          total: count,
          current: page,
          totalPages: Math.ceil(count/limit)
        },
          "Success find all events"
        )

    } catch (error) {
      response.error(res, error, "Failed to find all events")
    }
  },

  async findOne(req: IReqUser, res: Response){
    try {
      const {id} = req.params

      const result = await EventModel.findById(id)
      response.success(res, result, "Success to find an event")

    } catch (error) {
      response.error(res, error, "Failed to find one event")
    }
  },
  
  async update(req: IReqUser, res: Response){
    try {
      const {id} = req.params

      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true
      })

      response.success(res, result, "Success to update an event")

    } catch (error) {
      response.error(res, error, "Failed to update an event")
    }
  },

  async remove(req: IReqUser, res: Response){
    try {
        const {id} = req.params

      const result = await EventModel.findByIdAndDelete(id, {new: true})

      response.success(res, result, "Success to remove an event")

    } catch (error) {
      response.error(res, error, "Failed to remove an event")
    }
  },

  async findOneBySlug(req: IReqUser, res: Response){
    try {
        const {slug} = req.params

      const result = await EventModel.findOne({slug})

      response.success(res, result, "Success to find one event by slug")
    } catch (error) {
      response.error(res, error, "Failed to find one event by slug ")
    }
  }
}