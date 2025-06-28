import { ApiStateResponse, ApiMappingsResponse } from '../types';

export class ApiResponseModel {
  static validateStateResponse(response: any): response is ApiStateResponse {
    return response && typeof response.odds === 'string';
  }

  static validateMappingsResponse(
    response: any
  ): response is ApiMappingsResponse {
    return response && typeof response.mappings === 'string';
  }
}
