import * as Influx from 'influx'
import { INFLUX_HOST, INFLUX_DB, INFLUX_PORT } from './constants'

export const influx = new Influx.InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'birth_reg',
      fields: {
        location: Influx.FieldType.STRING,
        current_status: Influx.FieldType.STRING,
        gender: Influx.FieldType.STRING,
        age_in_days: Influx.FieldType.INTEGER
      },
      tags: ['reg_status']
    }
  ]
})

export const writePoints = (points: any[]) => {
  influx
    .writePoints(points)
    .catch((err: Error) =>
      console.log(`Error saving data to InfluxDB! ${err.stack}`)
    )
}
