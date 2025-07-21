import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as AppleStrategy } from "passport-apple";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("REPLIT_DOMAINS not provided - Replit Auth may not work");
}

if (!process.env.REPL_ID) {
  console.warn("REPL_ID not provided - Replit Auth may not work");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  try {
    if (process.env.DATABASE_URL) {
      const pgStore = connectPg(session);
      sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl / 1000, // Convert to seconds
        tableName: "sessions",
      });
      console.log("Using PostgreSQL session store");
    } else {
      console.log("Using memory session store");
    }
  } catch (error) {
    console.warn("Database session store failed, using memory store:", error);
  }

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
  provider?: string
) {
  console.log('Upserting user:', { claims, provider });
  
  // Extract ID properly based on provider
  let baseId;
  if (provider === 'google') {
    baseId = claims.sub || claims.id;
  } else if (provider === 'github') {
    baseId = claims.sub || claims.id;
  } else if (provider === 'replit') {
    baseId = claims.sub;
  } else {
    baseId = claims.sub;
  }
  
  // For replit, keep the original ID format, for others prefix with provider
  const userId = (provider && provider !== 'replit') ? `${provider}_${baseId}` : baseId;
  
  const userData = {
    id: userId,
    email: claims.email,
    firstName: claims.first_name || claims.given_name || claims.firstName || claims.givenName,
    lastName: claims.last_name || claims.family_name || claims.lastName || claims.familyName,
    profileImageUrl: claims.profile_image_url || claims.picture || claims.avatar_url,
    provider: provider || 'replit',
  };
  
  console.log('Creating user with data:', userData);
  
  try {
    await storage.upsertUser(userData);
    console.log('User upserted successfully');
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

function setupAuthRoutes(app: Express) {
  // Replit OAuth routes
  if (process.env.REPLIT_DOMAINS && process.env.REPL_ID) {
    app.get("/api/auth/replit", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/auth/replit/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
      })(req, res, next);
    });
  }

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Setting up Google OAuth routes");
    app.get("/api/auth/google", (req, res, next) => {
      console.log("Google OAuth route accessed");
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    });

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        console.log("Google auth successful, redirecting to dashboard");
        res.redirect("/");
      }
    );
  }

  // GitHub OAuth routes
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    app.get("/api/auth/github",
      passport.authenticate("github", { scope: ["user:email"] })
    );

    app.get("/api/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/login" }),
      (req, res) => {
        console.log("GitHub auth successful, redirecting to dashboard");
        res.redirect("/");
      }
    );
  }

  // Apple OAuth routes
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    app.get("/api/auth/apple",
      passport.authenticate("apple")
    );

    app.get("/api/auth/apple/callback",
      passport.authenticate("apple", { failureRedirect: "/login" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }

  // Legacy routes for backward compatibility
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });

  app.get("/api/callback", (req, res, next) => {
    if (process.env.REPLIT_DOMAINS && process.env.REPL_ID) {
      return passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
      })(req, res, next);
    }
    res.redirect("/login");
  });

  // Universal logout
  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    req.logout(() => {
      if (user?.provider === 'replit' && process.env.REPLIT_DOMAINS && process.env.REPL_ID) {
        // Redirect to Replit logout
        client.discovery(
          new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
          process.env.REPL_ID!
        ).then(config => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        }).catch(() => {
          res.redirect("/");
        });
      } else {
        res.redirect("/");
      }
    });
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Replit OAuth (if configured)
  if (process.env.REPLIT_DOMAINS && process.env.REPL_ID) {
    try {
      const config = await getOidcConfig();

      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        try {
          const claims = tokens.claims();
          console.log('Replit OAuth claims:', claims);
          
          const user = { 
            provider: 'replit',
            claims: claims,
            id: claims.sub
          };
          updateUserSession(user, tokens);
          await upsertUser(claims, 'replit');
          
          console.log('Replit user verified successfully:', user);
          verified(null, user);
        } catch (error) {
          console.error('Replit auth verification error:', error);
          verified(error, null);
        }
      };

      for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/auth/replit/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }
    } catch (error) {
      console.warn("Replit OAuth setup failed:", error.message);
    }
  }

  // Setup Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Use autolytiq.com for production, but allow flexibility for development
    const domain = process.env.GOOGLE_OAUTH_DOMAIN || 'autolytiq.com';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    
    console.log(`Google OAuth callback URL: ${protocol}://${domain}/api/auth/google/callback`);
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${protocol}://${domain}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `google_${profile.id}`;
        const claims = {
          sub: userId,
          email: profile.emails?.[0]?.value,
          first_name: profile.name?.givenName,
          last_name: profile.name?.familyName,
          profile_image_url: profile.photos?.[0]?.value
        };
        
        await upsertUser(claims, 'google');
        
        const user = { 
          provider: 'google',
          claims: claims,
          id: userId
        };
        
        done(null, user);
      } catch (error) {
        console.error('Google auth error:', error);
        done(error, null);
      }
    }));
  }

  // Setup GitHub OAuth
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    // Use autolytiq.com for GitHub OAuth callback
    const domain = 'autolytiq.com';
    const protocol = 'https';
    
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${protocol}://${domain}/api/auth/github/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `github_${profile.id}`;
        const claims = {
          sub: userId,
          email: profile.emails?.[0]?.value,
          first_name: profile.displayName?.split(' ')[0] || profile.username,
          last_name: profile.displayName?.split(' ').slice(1).join(' ') || '',
          profile_image_url: profile.photos?.[0]?.value
        };
        
        await upsertUser(claims, 'github');
        
        const user = {
          provider: 'github',
          claims: claims,
          id: userId
        };
        
        done(null, user);
      } catch (error) {
        console.error('GitHub auth error:', error);
        done(error, null);
      }
    }));
  }

  // Setup Apple OAuth
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    passport.use(new AppleStrategy({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      callbackURL: "https://autolytiq.com/api/auth/apple/callback"
    }, async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const user = {
          provider: 'apple',
          claims: {
            sub: `apple_${profile.id}`,
            email: profile.email,
            first_name: profile.name?.firstName || '',
            last_name: profile.name?.lastName || '',
            profile_image_url: null
          }
        };
        await upsertUser(user.claims, 'apple');
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));
  }

  passport.serializeUser((user: any, cb) => {
    console.log('Serializing user:', user);
    cb(null, user);
  });
  
  passport.deserializeUser((user: any, cb) => {
    console.log('Deserializing user:', user);
    cb(null, user);
  });

  // Setup all auth routes
  setupAuthRoutes(app);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if user is authenticated through any provider
  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For non-Replit providers, just check if user is authenticated
  if (user.provider !== 'replit') {
    return next();
  }

  // For Replit users, check token expiration and refresh if needed
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};