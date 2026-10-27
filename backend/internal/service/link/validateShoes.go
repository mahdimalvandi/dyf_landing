package link

import staticErrors "dyf-backend/statics/errors"

func (service Service) validateShoes(identifiers []int64) error {
	seen := make(map[int64]bool, len(identifiers))
	for _, identifier := range identifiers {
		if seen[identifier] {
			return staticErrors.ErrValidationFailed
		}
		seen[identifier] = true
		_, found, findError := service.shoeRepository.FindShoeByID(identifier)
		if findError != nil {
			return findError
		}
		if !found {
			return staticErrors.ErrShoeNotFound
		}
	}
	return nil
}
