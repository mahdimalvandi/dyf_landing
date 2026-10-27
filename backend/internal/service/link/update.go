package link

import (
	"net/http"

	dtoLink "dyf-backend/internal/dto/link"
	entityLink "dyf-backend/internal/entity/link"
	constantsLink "dyf-backend/statics/constants/link"
	staticErrors "dyf-backend/statics/errors"
)

func (service Service) Update(linkID int64, request dtoLink.UpdateLinkRequest) (dtoLink.LinkDetailResponse, int, error) {
	if request.IsDirectAccess && request.CustomerID <= 0 {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrCustomerNotFound
	}
	existingLink, found, findError := service.linkRepository.FindLinkByID(linkID)
	if findError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, findError
	}
	if !found {
		return dtoLink.LinkDetailResponse{}, http.StatusNotFound, staticErrors.ErrLinkNotFound
	}

	if len(request.ShoeIDs) == 0 {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrNoShoesSelectedForLink
	}
	if validationError := service.validateShoes(request.ShoeIDs); validationError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, validationError
	}

	if request.AuthMethod != constantsLink.AuthMethodDirect && request.AuthMethod != constantsLink.AuthMethodOTP {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrInvalidAuthMethod
	}

	if request.AuthMethod == constantsLink.AuthMethodOTP && request.PhoneNumber == "" {
		return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrValidationFailed
	}

	if request.CustomerID > 0 {
		_, customerFound, findCustomerError := service.customerRepository.FindCustomerByID(request.CustomerID)
		if findCustomerError != nil {
			return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, findCustomerError
		}
		if !customerFound {
			return dtoLink.LinkDetailResponse{}, http.StatusBadRequest, staticErrors.ErrCustomerNotFound
		}
	}

	existingLink.CustomerID = request.CustomerID
	existingLink.IsDirectAccess = request.IsDirectAccess
	existingLink.RecipientName = request.RecipientName
	existingLink.PhoneNumber = request.PhoneNumber
	existingLink.AuthMethod = request.AuthMethod
	existingLink.ShoeIDs = entityLink.Int64List(request.ShoeIDs)
	existingLink.ViewingDurationMinutes = request.ViewingDurationMinutes
	existingLink.ExpiresAt = request.ExpiresAt

	if saveError := service.linkRepository.UpdateLink(existingLink); saveError != nil {
		return dtoLink.LinkDetailResponse{}, http.StatusInternalServerError, saveError
	}

	return service.Detail(existingLink.ID)
}
