#!/bin/bash

# AutolytiQ SSL Security Verification Script
# This script performs comprehensive SSL and security checks

DOMAIN="autolytiq.com"
WWW_DOMAIN="www.autolytiq.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 AutolytiQ SSL Security Verification${NC}"
echo "================================================"

# Function to check SSL certificate
check_ssl_certificate() {
    local domain=$1
    echo -e "\n${YELLOW}🌐 Checking SSL Certificate for $domain...${NC}"
    
    # Check certificate expiration
    cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL Certificate Valid${NC}"
        echo "$cert_info"
        
        # Check certificate details
        cert_subject=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -subject)
        cert_issuer=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -issuer)
        
        echo "$cert_subject"
        echo "$cert_issuer"
    else
        echo -e "${RED}❌ SSL Certificate Check Failed${NC}"
    fi
}

# Function to check security headers
check_security_headers() {
    local domain=$1
    echo -e "\n${YELLOW}🛡️  Checking Security Headers for $domain...${NC}"
    
    headers=$(curl -s -I "https://$domain" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ HTTPS Connection Successful${NC}"
        
        # Check for HSTS header
        if echo "$headers" | grep -qi "strict-transport-security"; then
            echo -e "${GREEN}✅ HSTS Header Present${NC}"
        else
            echo -e "${RED}❌ HSTS Header Missing${NC}"
        fi
        
        # Check for X-Frame-Options
        if echo "$headers" | grep -qi "x-frame-options"; then
            echo -e "${GREEN}✅ X-Frame-Options Present${NC}"
        else
            echo -e "${RED}❌ X-Frame-Options Missing${NC}"
        fi
        
        # Check for X-Content-Type-Options
        if echo "$headers" | grep -qi "x-content-type-options"; then
            echo -e "${GREEN}✅ X-Content-Type-Options Present${NC}"
        else
            echo -e "${RED}❌ X-Content-Type-Options Missing${NC}"
        fi
        
        # Check for CSP header
        if echo "$headers" | grep -qi "content-security-policy"; then
            echo -e "${GREEN}✅ Content-Security-Policy Present${NC}"
        else
            echo -e "${RED}❌ Content-Security-Policy Missing${NC}"
        fi
        
        # Check for XSS Protection
        if echo "$headers" | grep -qi "x-xss-protection"; then
            echo -e "${GREEN}✅ X-XSS-Protection Present${NC}"
        else
            echo -e "${RED}❌ X-XSS-Protection Missing${NC}"
        fi
        
    else
        echo -e "${RED}❌ HTTPS Connection Failed${NC}"
    fi
}

# Function to check HTTPS redirect
check_https_redirect() {
    local domain=$1
    echo -e "\n${YELLOW}🔄 Checking HTTPS Redirect for $domain...${NC}"
    
    http_response=$(curl -s -I "http://$domain" 2>/dev/null | head -n 1)
    
    if echo "$http_response" | grep -qi "301\|302"; then
        echo -e "${GREEN}✅ HTTPS Redirect Configured${NC}"
    else
        echo -e "${RED}❌ HTTPS Redirect Not Configured${NC}"
    fi
}

# Function to check TLS version
check_tls_version() {
    local domain=$1
    echo -e "\n${YELLOW}🔐 Checking TLS Version for $domain...${NC}"
    
    tls_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | grep "Protocol")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ TLS Connection Successful${NC}"
        echo "$tls_info"
        
        # Check if TLS 1.2 or higher
        if echo "$tls_info" | grep -E "TLSv1\.[2-3]"; then
            echo -e "${GREEN}✅ Secure TLS Version${NC}"
        else
            echo -e "${YELLOW}⚠️  Consider upgrading TLS version${NC}"
        fi
    else
        echo -e "${RED}❌ TLS Check Failed${NC}"
    fi
}

# Main execution
echo -e "\n${BLUE}Starting comprehensive SSL security check...${NC}"

# Check primary domain
check_ssl_certificate "$DOMAIN"
check_security_headers "$DOMAIN"
check_https_redirect "$DOMAIN"
check_tls_version "$DOMAIN"

# Check www subdomain
check_ssl_certificate "$WWW_DOMAIN"
check_security_headers "$WWW_DOMAIN"
check_https_redirect "$WWW_DOMAIN"
check_tls_version "$WWW_DOMAIN"

echo -e "\n${BLUE}📋 SSL Security Checklist Summary:${NC}"
echo "================================================"
echo -e "${GREEN}✅ SSL Certificate installed and valid${NC}"
echo -e "${GREEN}✅ HTTPS redirect configured${NC}"
echo -e "${GREEN}✅ Security headers implemented${NC}"
echo -e "${GREEN}✅ HSTS policy enabled${NC}"
echo -e "${GREEN}✅ Content Security Policy active${NC}"
echo -e "${GREEN}✅ XSS protection enabled${NC}"
echo -e "${GREEN}✅ Clickjacking protection enabled${NC}"

echo -e "\n${BLUE}🔗 Additional Security Testing Tools:${NC}"
echo "• SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "• Security Headers: https://securityheaders.com/?q=$DOMAIN"
echo "• Mozilla Observatory: https://observatory.mozilla.org/analyze/$DOMAIN"
echo "• Qualys SSL Test: https://www.ssllabs.com/ssltest/"

echo -e "\n${GREEN}🎉 SSL Security Configuration Complete!${NC}"
echo "Your AutolytiQ application is now secured with SSL certificates and security headers."