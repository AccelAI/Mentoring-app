// Utility functions for working with ORCID API responses

/**
 * Extract profile information from ORCID record for account creation
 * @param {Object} orcidRecord - The full ORCID record JSON response
 * @returns {Object} Simplified profile data for app account creation
 */
export const extractProfileFromOrcidRecord = (orcidRecord) => {
  try {
    const person = orcidRecord?.person || {}
    const name = person?.name || {}
    const emails = person?.emails?.email || []
    const addresses = person?.addresses?.address || []
    const employments =
      orcidRecord?.['activities-summary']?.employments?.['affiliation-group'] ||
      []
    const educations =
      orcidRecord?.['activities-summary']?.educations?.['affiliation-group'] ||
      []

    // Extract name
    const firstName = name['given-names']?.value || ''
    const lastName = name['family-name']?.value || ''
    const fullName = `${firstName} ${lastName}`.trim()

    // Extract primary email (if available and public)
    const primaryEmail =
      emails.find((email) => email.primary === true)?.email ||
      emails[0]?.email ||
      ''

    // Extract current employment/affiliation
    let currentAffiliation = ''
    if (employments.length > 0) {
      const latestEmployment = employments[0]?.['employment-summary']?.[0]
      if (latestEmployment) {
        currentAffiliation = latestEmployment.organization?.name || ''
      }
    }

    // Extract education (latest)
    let education = ''
    if (educations.length > 0) {
      const latestEducation = educations[0]?.['education-summary']?.[0]
      if (latestEducation) {
        education = latestEducation.organization?.name || ''
      }
    }

    // Extract country from address
    let country = ''
    if (addresses.length > 0) {
      country = addresses[0].country?.value || ''
    }

    return {
      orcidId: orcidRecord['orcid-identifier']?.path,
      firstName,
      lastName,
      fullName,
      email: primaryEmail,
      currentAffiliation,
      education,
      country,
      // Include raw data for more detailed processing if needed
      rawOrcidData: orcidRecord
    }
  } catch (error) {
    console.error('Error extracting profile from ORCID record:', error)
    return {
      orcidId: orcidRecord?.['orcid-identifier']?.path || '',
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      currentAffiliation: '',
      education: '',
      country: '',
      profileComplete: false,
      error: 'Failed to parse ORCID record'
    }
  }
}

/**
 * Fetch ORCID record and extract profile information
 * @param {string} orcidId - The ORCID ID (format: 0000-0000-0000-0000)
 * @param {string} accessToken - The access token from ORCID OAuth
 * @returns {Promise<Object>} Profile data extracted from ORCID record
 */
export const fetchOrcidProfile = async (orcidId, accessToken) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/orcid/record/${orcidId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ORCID record: ${response.status}`)
    }

    const orcidRecord = await response.json()
    return extractProfileFromOrcidRecord(orcidRecord)
  } catch (error) {
    console.error('Error fetching ORCID profile:', error)
    throw error
  }
}
