import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuthorItems from "../components/author/AuthorItems";
import Skeleton from "../components/UI/Skeleton";
import AuthorBanner from "../images/author_banner.jpg";

const DEFAULT_AUTHOR_ID = "73855012";

const Author = () => {
  const { authorId } = useParams();
  const activeAuthorId = authorId || DEFAULT_AUTHOR_ID;
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAuthor() {
      setLoading(true);
      setError("");
      setCopied(false);

      try {
        const { data } = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors",
          { params: { author: activeAuthorId } }
        );

        if (!cancelled) {
          setAuthor(data?.authorId ? data : null);

          if (!data?.authorId) {
            setError("Author not found.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch author:", error);

        if (!cancelled) {
          setAuthor(null);
          setError("Unable to load this author right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    window.scrollTo(0, 0);
    fetchAuthor();

    return () => {
      cancelled = true;
    };
  }, [activeAuthorId]);

  async function copyAddress() {
    if (!author?.address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(author.address);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
    }
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                {error ? (
                  <p className="text-center">{error}</p>
                ) : (
                  <div className="d_profile de-flex">
                    <div className="de-flex-col">
                      <div className="profile_avatar">
                        {loading ? (
                          <Skeleton
                            width="150px"
                            height="150px"
                            borderRadius="50%"
                          />
                        ) : (
                          <img src={author.authorImage} alt={author.authorName} />
                        )}

                        {!loading && <i className="fa fa-check"></i>}
                        <div className="profile_name">
                          {loading ? (
                            <>
                              <Skeleton width="180px" height="28px" />
                              <Skeleton width="280px" height="18px" />
                            </>
                          ) : (
                            <h4>
                              {author.authorName}
                              <span className="profile_username">
                                @{author.tag}
                              </span>
                              <span id="wallet" className="profile_wallet">
                                {author.address}
                              </span>
                              <button
                                type="button"
                                id="btn_copy"
                                title="Copy wallet address"
                                onClick={copyAddress}
                              >
                                {copied ? "Copied" : "Copy"}
                              </button>
                            </h4>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        {loading ? (
                          <Skeleton width="110px" height="18px" />
                        ) : (
                          <div className="profile_follower">
                            {author.followers} followers
                          </div>
                        )}
                        <button type="button" className="btn-main">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!error && (
                <div className="col-md-12">
                  <div className="de_tab tab_simple">
                    <AuthorItems author={author} loading={loading} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
