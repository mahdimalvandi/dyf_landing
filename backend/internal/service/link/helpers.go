package link

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
)

func generateNumericCode(length int) (string, error) {
	maximumValue := big.NewInt(1)
	for index := 0; index < length; index++ {
		maximumValue.Mul(maximumValue, big.NewInt(10))
	}

	randomBigInt, randomError := rand.Int(rand.Reader, maximumValue)
	if randomError != nil {
		return "", randomError
	}

	formatString := fmt.Sprintf("%%0%dd", length)
	return fmt.Sprintf(formatString, randomBigInt.Int64()), nil
}

func generateSecureOpaqueToken() (string, string, error) {
	randomBytes := make([]byte, 32)
	if _, readError := rand.Read(randomBytes); readError != nil {
		return "", "", readError
	}
	rawToken := hex.EncodeToString(randomBytes)

	md5Hasher := md5.New()
	md5Hasher.Write([]byte(rawToken))
	tokenHash := hex.EncodeToString(md5Hasher.Sum(nil))

	return rawToken, tokenHash, nil
}
