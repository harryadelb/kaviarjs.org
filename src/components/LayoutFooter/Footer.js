/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 * @flow
 */

import Container from 'components/Container';
import ExternalFooterLink from './ExternalFooterLink';
import FooterLink from './FooterLink';
import FooterNav from './FooterNav';
import MetaTitle from 'templates/components/MetaTitle';
import React from 'react';
import {colors, media} from 'theme';
import {sectionListCommunity, sectionListDocs} from 'utils/sectionList';

import ossLogoPng from 'images/oss_logo.png';

const Footer = ({layoutHasSidebar = false}: {layoutHasSidebar: boolean}) => (
  <footer
    css={{
      backgroundColor: colors.darker,
      color: colors.white,
      paddingTop: 10,
      paddingBottom: 50,

      [media.size('sidebarFixed')]: {
        paddingTop: 40,
      },
    }}>
    <Container>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',

          [media.between('small', 'medium')]: {
            paddingRight: layoutHasSidebar ? 240 : null,
          },

          [media.between('large', 'largerSidebar')]: {
            paddingRight: layoutHasSidebar ? 280 : null,
          },
          [media.between('largerSidebar', 'sidebarFixed', true)]: {
            paddingRight: layoutHasSidebar ? 380 : null,
          },
        }}>
        <div
          css={{
            flexWrap: 'wrap',
            display: 'flex',

            [media.lessThan('large')]: {
              width: '100%',
            },
            [media.greaterThan('xlarge')]: {
              width: 'calc(100% / 3 * 2)',
              paddingLeft: 40,
            },
          }}>
          <FooterNav layoutHasSidebar={layoutHasSidebar}>
            <MetaTitle onDark={true}>Docs</MetaTitle>
            {sectionListDocs.map(section => {
              const defaultItem = section.items[0];
              return (
                <FooterLink
                  to={`/docs/${defaultItem.id}.html`}
                  key={section.title}>
                  {section.title}
                </FooterLink>
              );
            })}
          </FooterNav>
          <FooterNav layoutHasSidebar={layoutHasSidebar}>
            <MetaTitle onDark={true}>Channels</MetaTitle>
            <ExternalFooterLink
              href="https://github.com/kaviarjs/kaviarjs.org"
              target="_blank"
              rel="noopener">
              GitHub
            </ExternalFooterLink>
            <ExternalFooterLink
              href="https://stackoverflow.com/questions/tagged/kaviarjs"
              target="_blank"
              rel="noopener">
              Stack Overflow
            </ExternalFooterLink>
            <ExternalFooterLink
              href="https://forums.meteor.com"
              target="_blank"
              rel="noopener">
              Discussion Forum
            </ExternalFooterLink>
            <ExternalFooterLink
              href="https://discord.gg/XUywXZ"
              target="_blank"
              rel="noopener">
              Kaviar Chat
            </ExternalFooterLink>
            <ExternalFooterLink
              href="https://twitter.com/cultofcoders"
              target="_blank"
              rel="noopener">
              Twitter
            </ExternalFooterLink>
          </FooterNav>
          <FooterNav layoutHasSidebar={layoutHasSidebar}>
            <MetaTitle onDark={true}>More</MetaTitle>
            <FooterLink to="/tutorial/tutorial.html">Tutorial</FooterLink>
          </FooterNav>
        </div>
        <section
          css={{
            paddingTop: 40,
            display: 'block !important', // Override 'Installation' <style> specifics

            [media.greaterThan('xlarge')]: {
              width: 'calc(100% / 3)',
              order: -1,
            },
            [media.greaterThan('large')]: {
              order: -1,
              width: layoutHasSidebar ? null : 'calc(100% / 3)',
            },
            [media.lessThan('large')]: {
              textAlign: 'center',
              width: '100%',
              paddingTop: 40,
            },
          }}>
          <a
            href="https://www.cultofcoders.com/portfolio"
            target="_blank"
            rel="noopener">
            {/* <img
              
              
              src={ossLogoPng}
            /> */}
            <div
              css={{
                maxWidth: 160,
                height: 'auto',
              }}>
              <svg
                viewBox="0 0 160 43"
                width="150"
                height="40"
                fill="#ea6032"
              >
                <path d="M10 11v21a1 1 0 0 0 1 1h30a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h39a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H11a1 1 0 0 0-1 1zm83-9v39a2 2 0 0 1-2 2H52a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v30a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1V2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2zm50 33v6a2 2 0 0 1-2 2h-39a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v30a1 1 0 0 0 1 1h30a2 2 0 0 1 2 2z"></path>
                <path d="M160 2v39a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11a1 1 0 0 0-1-1h-30a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h39a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </a>
          <p
            css={{
              color: colors.subtleOnDark,
              paddingTop: 15,
            }}>
            {`Copyright © ${new Date().getFullYear()} Cult Of Coders Inc.`}
          </p>
        </section>
      </div>
    </Container>
  </footer>
);

export default Footer;
