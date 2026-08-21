import { randomUUID } from 'node:crypto'
import type { IdGenerator } from '@/application/ports/id-generator'
import {
  accessGrantId,
  businessId,
  factId,
  operationId,
  userId,
  type AccessGrantId,
  type BusinessId,
  type FactId,
  type OperationId,
  type UserId,
} from '@/domain/shared/ids'

export class UuidGenerator implements IdGenerator {
  businessId(): BusinessId {
    return businessId(randomUUID())
  }

  userId(): UserId {
    return userId(randomUUID())
  }

  accessGrantId(): AccessGrantId {
    return accessGrantId(randomUUID())
  }

  factId(): FactId {
    return factId(randomUUID())
  }

  operationId(): OperationId {
    return operationId(randomUUID())
  }
}
